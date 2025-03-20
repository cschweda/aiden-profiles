import { relative } from 'path';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Spinner frames
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerFrame = 0;
let spinnerInterval;

export default class PrettyReporter {
  ctx = null;
  start = 0;
  filesCount = 0;
  testCount = 0;
  passedTests = 0;
  failedTests = 0;
  skippedTests = 0;
  fileResults = {};

  constructor(ctx) {
    this.ctx = ctx;
  }

  onInit() {
    this.start = Date.now();
    console.log();
    console.log(`${colors.bold}${colors.cyan}╔═════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║      AIDEN COFFEE PROFILES TESTS       ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╚═════════════════════════════════════════╝${colors.reset}`);
    console.log();
    
    this.startSpinner('Setting up test environment');
  }

  onCollected() {
    this.stopSpinner();
    this.filesCount = this.ctx.state.getFiles().length;
    this.testCount = this.ctx.state.getTests().length;
    
    console.log(`${colors.dim}Found ${colors.bold}${this.filesCount}${colors.reset}${colors.dim} test files with ${colors.bold}${this.testCount}${colors.reset}${colors.dim} tests${colors.reset}`);
    console.log();
    
    this.startSpinner('Running tests');
  }

  onTaskUpdate(packs) {
    for (const pack of packs) {
      if (!pack) continue;
      
      const filePath = pack.file?.name;
      if (!filePath) continue;
      
      const relativePath = relative(process.cwd(), filePath);
      
      if (!this.fileResults[relativePath]) {
        this.fileResults[relativePath] = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0
        };
      }
      
      for (const task of pack.tasks || []) {
        if (!task) continue;
        
        this.fileResults[relativePath].total++;
        
        if (task.result?.state === 'pass') {
          this.passedTests++;
          this.fileResults[relativePath].passed++;
        }
        else if (task.result?.state === 'fail') {
          this.failedTests++;
          this.fileResults[relativePath].failed++;
        }
        else if (task.mode === 'skip' || task.mode === 'todo') {
          this.skippedTests++;
          this.fileResults[relativePath].skipped++;
        }
      }
    }
  }

  onFinished() {
    this.stopSpinner();
    const duration = Date.now() - this.start;
    
    this.printDashboard(duration);
  }
  
  startSpinner(message) {
    this.stopSpinner();
    spinnerFrame = 0;
    
    spinnerInterval = setInterval(() => {
      const frame = spinnerFrames[spinnerFrame++ % spinnerFrames.length];
      process.stdout.write(`\r${colors.cyan}${frame}${colors.reset} ${message}...`);
    }, 80);
  }
  
  stopSpinner() {
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
      spinnerInterval = null;
      process.stdout.write('\r' + ' '.repeat(60) + '\r');
    }
  }
  
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(0);
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  drawProgressBar(percent, width = 40, completeChar = '█', incompleteChar = '░') {
    const completeLen = Math.floor(width * (percent / 100));
    const completeStr = completeChar.repeat(completeLen);
    const incompleteStr = incompleteChar.repeat(width - completeLen);
    return `${completeStr}${incompleteStr}`;
  }
  
  printDashboard(duration) {
    const passPercent = this.testCount > 0 ? (this.passedTests / this.testCount) * 100 : 0;
    
    console.log();
    console.log(`${colors.bold}${colors.cyan}╔═════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║         TEST RESULTS DASHBOARD         ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╚═════════════════════════════════════════╝${colors.reset}`);
    console.log();
    
    // Test summary
    console.log(`${colors.bold}📊 Test Summary${colors.reset}`);
    console.log(`   ${colors.green}✓ Passed:${colors.reset} ${this.passedTests}`);
    console.log(`   ${colors.red}✗ Failed:${colors.reset} ${this.failedTests}`);
    console.log(`   ${colors.yellow}⚠ Skipped:${colors.reset} ${this.skippedTests}`);
    console.log(`   ${colors.blue}Total:${colors.reset} ${this.testCount}`);
    console.log(`   ${colors.magenta}Duration:${colors.reset} ${this.formatDuration(duration)}`);
    console.log();
    
    // Progress bar
    console.log(`${colors.bold}🏁 Progress${colors.reset}`);
    console.log(`   ${passPercent.toFixed(2)}% pass rate`);
    console.log(`   ${colors.green}${this.drawProgressBar(passPercent, 40)}${colors.reset}`);
    console.log();
    
    // File breakdown
    console.log(`${colors.bold}📁 File Breakdown${colors.reset}`);
    
    Object.entries(this.fileResults)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([file, stats]) => {
        const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
        const rateColor = passRate === 100 ? colors.green : (passRate >= 80 ? colors.yellow : colors.red);
        const fileName = file.split('/').pop();
        
        console.log(`   ${fileName.padEnd(20)} ${stats.passed}/${stats.total} ${rateColor}(${passRate.toFixed(0)}%)${colors.reset}`);
      });
    
    console.log();
    
    // Coffee cup ASCII art
    console.log(colors.cyan + '       )  (');
    console.log('      (   ) )');
    console.log('       ) ( (');
    console.log('     _______)_');
    console.log('  .-\'---------|  |');
    console.log(' ( C|/\\/\\/\\/\\/|  |');
    console.log('  \'-./\\/\\/\\/\\|  |');
    console.log('    \'_________\'');
    console.log('     \'-------\'' + colors.reset);
    console.log();
    
    // Overall status
    if (this.failedTests === 0) {
      console.log(`${colors.bold}${colors.green}✅ ALL TESTS PASSED!${colors.reset}`);
    } else {
      console.log(`${colors.bold}${colors.red}❌ ${this.failedTests} TEST${this.failedTests !== 1 ? 'S' : ''} FAILED!${colors.reset}`);
    }
    
    console.log();
  }
}