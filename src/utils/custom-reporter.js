const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
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
  }
};

// Spinner frames
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerInterval;
let spinnerIndex = 0;

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  duration: 0,
  files: {},
};

class CustomReporter {
  onInit() {
    console.log('');
    console.log(colors.bright + colors.fg.cyan + '╔════════════════════════════════════════════╗');
    console.log(colors.bright + colors.fg.cyan + '║     ' + colors.fg.yellow + 'AIDEN COFFEE PROFILES TEST RUNNER    ' + colors.fg.cyan + '║');
    console.log(colors.bright + colors.fg.cyan + '╚════════════════════════════════════════════╝' + colors.reset);
    console.log('');
    
    // Start spinner
    this.startSpinner('Initializing tests');
  }
  
  onFinished() {
    this.stopSpinner();
    this.printDashboard();
  }
  
  onCollected() {
    this.stopSpinner();
    this.startSpinner('Running tests');
  }
  
  onTaskUpdate(packs) {
    for (const pack of packs) {
      if (!pack) continue;
      
      for (const task of pack.tasks || []) {
        if (!task) continue;
        
        // Get file details
        const filePath = task.file?.name || 'unknown';
        const fileName = filePath.split('/').pop() || 'unknown';
        
        if (!testResults.files[fileName]) {
          testResults.files[fileName] = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
          };
        }
        
        testResults.files[fileName].total++;
        testResults.total++;
        
        if (task.result?.state === 'pass') {
          testResults.passed++;
          testResults.files[fileName].passed++;
        } else if (task.result?.state === 'fail') {
          testResults.failed++;
          testResults.files[fileName].failed++;
        } else if (task.mode === 'skip' || task.mode === 'todo') {
          testResults.skipped++;
          testResults.files[fileName].skipped++;
        }
        
        // Track duration
        if (task.result?.duration) {
          testResults.duration += task.result.duration;
        }
      }
    }
  }
  
  // Helper methods
  startSpinner(text) {
    if (spinnerInterval) this.stopSpinner();
    
    spinnerIndex = 0;
    process.stdout.write('\r');
    
    spinnerInterval = setInterval(() => {
      const frame = spinnerFrames[spinnerIndex];
      process.stdout.write('\r' + colors.fg.cyan + frame + ' ' + colors.reset + text + '...');
      spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
    }, 80);
  }
  
  stopSpinner() {
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
      spinnerInterval = null;
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }
  }
  
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  }
  
  drawProgressBar(percent, width = 40, completeChar = '█', incompleteChar = '░') {
    const completeLen = Math.floor(width * (percent / 100));
    const completeStr = completeChar.repeat(completeLen);
    const incompleteStr = incompleteChar.repeat(width - completeLen);
    return `${completeStr}${incompleteStr}`;
  }
  
  printDashboard() {
    const passPercent = testResults.total > 0 ? (testResults.passed / testResults.total) * 100 : 0;
    
    console.log('');
    console.log(colors.bright + colors.fg.cyan + '╔════════════════════════════════════════════╗');
    console.log(colors.bright + colors.fg.cyan + '║          ' + colors.fg.yellow + 'TEST RESULTS DASHBOARD           ' + colors.fg.cyan + '║');
    console.log(colors.bright + colors.fg.cyan + '╚════════════════════════════════════════════╝' + colors.reset);
    console.log('');
    
    // Summary
    console.log(colors.bright + '📊 Test Summary:' + colors.reset);
    console.log(`   ${colors.fg.green}✓ Passed:${colors.reset} ${testResults.passed}`);
    console.log(`   ${colors.fg.red}✗ Failed:${colors.reset} ${testResults.failed}`);
    console.log(`   ${colors.fg.yellow}⚠ Skipped:${colors.reset} ${testResults.skipped}`);
    console.log(`   ${colors.fg.blue}Total:${colors.reset} ${testResults.total}`);
    console.log(`   ${colors.fg.magenta}Duration:${colors.reset} ${this.formatDuration(testResults.duration)}`);
    console.log('');
    
    // Progress bar
    console.log(colors.bright + '🏁 Progress:' + colors.reset);
    console.log(`   ${passPercent.toFixed(2)}% complete`);
    console.log(`   ${colors.fg.green}${this.drawProgressBar(passPercent, 40)}${colors.reset}`);
    console.log('');
    
    // File breakdown
    console.log(colors.bright + '📁 File Breakdown:' + colors.reset);
    Object.entries(testResults.files)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([file, stats]) => {
        const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
        const color = passRate === 100 ? colors.fg.green : (passRate >= 80 ? colors.fg.yellow : colors.fg.red);
        console.log(`   ${file.padEnd(25)} ${stats.passed}/${stats.total} ${color}(${passRate.toFixed(0)}%)${colors.reset}`);
      });
    console.log('');
    
    // Coffee cup ASCII art
    const coffeeColor = testResults.failed > 0 ? colors.fg.red : colors.fg.green;
    
    console.log(coffeeColor + '       )  (');
    console.log('      (   ) )');
    console.log('       ) ( (');
    console.log('     _______)_');
    console.log('  .-\'---------|  |');
    console.log(' ( C|/\\/\\/\\/\\/|  |');
    console.log('  \'-./\\/\\/\\/\\|  |');
    console.log('    \'_________\'');
    console.log('     \'-------\'' + colors.reset);
    console.log('');
    
    // Overall status
    if (testResults.failed === 0) {
      console.log(colors.bright + colors.fg.green + '✅ ALL TESTS PASSED!' + colors.reset);
    } else {
      console.log(colors.bright + colors.fg.red + '❌ SOME TESTS FAILED!' + colors.reset);
    }
    console.log('');
  }
}

module.exports = {
  name: 'custom-reporter',
  default: CustomReporter,
};