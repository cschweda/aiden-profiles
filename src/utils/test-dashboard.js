/**
 * Custom Vitest reporter to display a dashboard with test stats
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    gray: '\x1b[100m',
    crimson: '\x1b[48m'
  }
};

// Progress spinner frames
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerInterval;
let spinnerFrame = 0;

// Store test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  duration: 0,
  startTime: null,
  endTime: null,
  components: {},
  testsPerFile: {},
  slowestTests: [],
  flakyTests: [],
};

/**
 * Draw a horizontal progress bar
 * @param {number} percent - Percentage to fill (0-100)
 * @param {number} width - Width of the bar in characters
 * @param {string} completeChar - Character for completed portion
 * @param {string} incompleteChar - Character for incomplete portion
 * @returns {string} - The progress bar string
 */
function drawProgressBar(percent, width = 40, completeChar = '█', incompleteChar = '░') {
  const completeLen = Math.floor(width * (percent / 100));
  const completeStr = completeChar.repeat(completeLen);
  const incompleteStr = incompleteChar.repeat(width - completeLen);
  return `${completeStr}${incompleteStr}`;
}

/**
 * Format duration to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

/**
 * Draw a box with a title and content
 * @param {string} title - Box title
 * @param {string[]} content - Array of content lines
 * @param {number} width - Box width
 * @param {string} titleColor - Color for the title
 * @returns {string} - The box string
 */
function drawBox(title, content, width = 40, titleColor = colors.fg.cyan) {
  const topBorder = `┌─${title ? ` ${titleColor}${title}${colors.reset} ` : ''}${'─'.repeat(Math.max(0, width - title.length - 4))}┐`;
  const bottomBorder = `└${'─'.repeat(width - 2)}┘`;
  
  const formattedContent = content.map(line => {
    if (line.length > width - 4) {
      line = line.substring(0, width - 7) + '...';
    }
    const padding = ' '.repeat(Math.max(0, width - line.length - 4));
    return `│ ${line}${padding} │`;
  });
  
  return [topBorder, ...formattedContent, bottomBorder].join('\n');
}

/**
 * Draw a sparkline chart
 * @param {number[]} data - Data points
 * @param {number} width - Width of the chart
 * @returns {string} - The sparkline string
 */
function drawSparkline(data, width = 40) {
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // If we have too many data points, sample them
  let points = data;
  if (data.length > width) {
    points = [];
    const step = data.length / width;
    for (let i = 0; i < width; i++) {
      const dataIndex = Math.floor(i * step);
      points.push(data[dataIndex]);
    }
  }
  
  // If we have too few data points, repeat them
  if (data.length < width) {
    points = Array(width).fill(0).map((_, i) => {
      const dataIndex = Math.floor(i * data.length / width);
      return data[dataIndex];
    });
  }
  
  // Draw the sparkline
  return points.map(p => {
    const normalized = (p - min) / range;
    const blockIndex = Math.min(Math.floor(normalized * blocks.length), blocks.length - 1);
    return blocks[blockIndex];
  }).join('');
}

/**
 * Start the progress spinner
 */
function startSpinner() {
  if (spinnerInterval) clearInterval(spinnerInterval);
  spinnerFrame = 0;
  
  // Clear the spinner line
  process.stdout.write('\r');
  
  spinnerInterval = setInterval(() => {
    const frame = spinnerFrames[spinnerFrame];
    process.stdout.write(`\r${colors.fg.cyan}${frame}${colors.reset} Running tests...`);
    spinnerFrame = (spinnerFrame + 1) % spinnerFrames.length;
  }, 80);
}

/**
 * Stop the progress spinner
 */
function stopSpinner() {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
    // Clear the spinner line
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
  }
}

/**
 * Custom Vitest reporter
 * @implements {import('vitest').Reporter}
 */
class DashboardReporter {
  onInit(context) {
    results.startTime = new Date();
    startSpinner();
  }

  onFinished(files, errors) {
    stopSpinner();
    results.endTime = new Date();
    this.printDashboard();
  }

  onTaskUpdate(packs) {
    for (const pack of packs) {
      for (const task of pack.tasks) {
        // Extract component name from test file path
        const filePath = task.file?.name || '';
        const fileName = filePath.split('/').pop().replace('.spec.js', '');
        
        if (!results.testsPerFile[fileName]) {
          results.testsPerFile[fileName] = { total: 0, passed: 0, failed: 0, duration: 0 };
        }
        
        results.testsPerFile[fileName].total++;
        results.total++;
        
        if (task.result?.state === 'pass') {
          results.passed++;
          results.testsPerFile[fileName].passed++;
          
          // Track test duration for slow tests
          if (task.result.duration > 50) {
            results.slowestTests.push({
              name: task.name,
              file: fileName,
              duration: task.result.duration
            });
          }
        } else if (task.result?.state === 'fail') {
          results.failed++;
          results.testsPerFile[fileName].failed++;
        } else if (task.mode === 'skip' || task.mode === 'todo') {
          results.skipped++;
        }
        
        // Update component stats
        if (fileName) {
          if (!results.components[fileName]) {
            results.components[fileName] = { total: 0, passed: 0, failed: 0 };
          }
          
          results.components[fileName].total++;
          
          if (task.result?.state === 'pass') {
            results.components[fileName].passed++;
          } else if (task.result?.state === 'fail') {
            results.components[fileName].failed++;
          }
        }
      }
    }
  }

  onTaskComplete(task) {
    if (task.result?.duration) {
      results.duration += task.result.duration;
    }
  }

  printDashboard() {
    console.log('\n');
    const width = 80;
    const halfWidth = width / 2 - 2;
    
    // Calculate percentage
    const passPercentage = results.total > 0 ? (results.passed / results.total) * 100 : 0;
    
    // Draw header
    console.log(colors.bright + colors.fg.cyan + '╔' + '═'.repeat(width - 2) + '╗' + colors.reset);
    console.log(colors.bright + colors.fg.cyan + '║' + colors.reset + colors.bright + ' AIDEN COFFEE PROFILES TEST DASHBOARD ' + ' '.repeat(width - 38) + colors.fg.cyan + '║' + colors.reset);
    console.log(colors.bright + colors.fg.cyan + '╚' + '═'.repeat(width - 2) + '╝' + colors.reset);
    console.log('');
    
    // Main stats
    const statsContent = [
      `${colors.fg.green}✓ Passed:${colors.reset} ${results.passed}`,
      `${colors.fg.red}✗ Failed:${colors.reset} ${results.failed}`,
      `${colors.fg.yellow}⚠ Skipped:${colors.reset} ${results.skipped}`,
      `${colors.fg.blue}Total:${colors.reset} ${results.total}`,
      '',
      `${colors.fg.magenta}Duration:${colors.reset} ${formatDuration(results.duration)}`,
      `${colors.fg.magenta}Started:${colors.reset} ${results.startTime.toLocaleTimeString()}`
    ];
    
    const progressContent = [
      `${passPercentage.toFixed(2)}% pass rate`,
      '',
      `${colors.fg.green}${drawProgressBar(passPercentage, 38)}${colors.reset}`,
      '',
      `${results.passed}/${results.total} tests passed`
    ];
    
    // File breakdown
    const fileBreakdown = Object.entries(results.testsPerFile)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([file, stats]) => {
        const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
        const passRateColor = passRate === 100 ? colors.fg.green : (passRate >= 80 ? colors.fg.yellow : colors.fg.red);
        return `${file.padEnd(20)} ${stats.passed}/${stats.total} ${passRateColor}(${passRate.toFixed(0)}%)${colors.reset}`;
      })
      .slice(0, 5);
    
    // Slowest tests
    const slowestTests = results.slowestTests
      .sort((a, b) => b.duration - a.duration)
      .map(test => `${test.file}: ${test.name.substring(0, 20)}... (${formatDuration(test.duration)})`)
      .slice(0, 3);
    
    if (slowestTests.length === 0) {
      slowestTests.push('No slow tests detected!');
    }
    
    // Render boxes side by side
    const rows = [
      [
        drawBox('Test Statistics', statsContent, halfWidth),
        drawBox('Test Progress', progressContent, halfWidth)
      ],
      [
        drawBox('File Breakdown', fileBreakdown.length ? fileBreakdown : ['No files with tests'], width)
      ],
      [
        drawBox('Slowest Tests', slowestTests, width)
      ]
    ];
    
    // Print rows
    for (const row of rows) {
      if (row.length === 1) {
        console.log(row[0]);
      } else {
        const lines1 = row[0].split('\n');
        const lines2 = row[1].split('\n');
        const maxLines = Math.max(lines1.length, lines2.length);
        
        for (let i = 0; i < maxLines; i++) {
          const line1 = i < lines1.length ? lines1[i] : ' '.repeat(halfWidth);
          const line2 = i < lines2.length ? lines2[i] : ' '.repeat(halfWidth);
          console.log(line1 + '  ' + line2);
        }
      }
      console.log('');
    }
    
    // Footer with ASCII art coffee cup
    console.log(colors.fg.cyan + '       )  (');
    console.log('      (   ) )');
    console.log('       ) ( (');
    console.log(`     _______)_${colors.fg.yellow}_${colors.fg.cyan}_`);
    console.log(`  .-'---------|${colors.fg.yellow}  ${colors.fg.cyan}|`);
    console.log(` ( C${colors.fg.yellow}|${colors.fg.cyan}/\\/\\/\\/\\/|${colors.fg.yellow}  ${colors.fg.cyan}|`);
    console.log(`  '-./\\/\\/\\/\\|${colors.fg.yellow}${colors.fg.yellow}  ${colors.fg.cyan}|`);
    console.log('    '_________\'');
    console.log('     \'-------\'');
    console.log(colors.reset);
    
    // Overall status
    const overallStatus = results.failed === 0 
      ? colors.fg.green + '✓ ALL TESTS PASSED!' + colors.reset
      : colors.fg.red + '✗ SOME TESTS FAILED!' + colors.reset;
    
    console.log(`${colors.bright}${overallStatus}${colors.reset}`);
    console.log('');
  }
}

module.exports = {
  name: 'vitest-dashboard-reporter',
  default: DashboardReporter
};