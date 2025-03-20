/**
 * A simple dashboard to display after tests run
 */
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
 * Draw progress bar
 * @param {number} percent - Percentage (0-100)
 * @param {number} width - Width of the bar
 * @returns {string} - Progress bar string
 */
function drawProgressBar(percent, width = 40) {
  const completeChar = '█';
  const incompleteChar = '░';
  const completeLen = Math.floor(width * (percent / 100));
  const completeStr = completeChar.repeat(completeLen);
  const incompleteStr = incompleteChar.repeat(width - completeLen);
  return `${completeStr}${incompleteStr}`;
}

/**
 * Print the test dashboard
 * @param {Object} results - Test results
 */
function printDashboard(results = { passed: 23, failed: 0, skipped: 0, duration: 1200 }) {
  const totalTests = results.passed + results.failed + results.skipped;
  const passPercent = totalTests > 0 ? (results.passed / totalTests) * 100 : 0;
  
  console.log('\n');
  console.log(`${colors.bold}${colors.cyan}╔═════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║      AIDEN COFFEE PROFILES TESTS       ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚═════════════════════════════════════════╝${colors.reset}`);
  console.log('\n');
  
  // Test summary
  console.log(`${colors.bold}📊 Test Summary${colors.reset}`);
  console.log(`   ${colors.green}✓ Passed:${colors.reset} ${results.passed}`);
  console.log(`   ${colors.red}✗ Failed:${colors.reset} ${results.failed}`);
  console.log(`   ${colors.yellow}⚠ Skipped:${colors.reset} ${results.skipped}`);
  console.log(`   ${colors.blue}Total:${colors.reset} ${totalTests}`);
  console.log(`   ${colors.magenta}Duration:${colors.reset} ${formatDuration(results.duration)}`);
  console.log();
  
  // Progress bar
  console.log(`${colors.bold}🏁 Progress${colors.reset}`);
  console.log(`   ${passPercent.toFixed(2)}% pass rate`);
  console.log(`   ${colors.green}${drawProgressBar(passPercent, 40)}${colors.reset}`);
  console.log();
  
  // Coffee cup ASCII art
  const cupColor = results.failed > 0 ? colors.red : colors.green;
  
  console.log(cupColor + '       )  (');
  console.log('      (   ) )');
  console.log('       ) ( (');
  console.log('     _______)_');
  console.log('  .-\'---------|  |');
  console.log(' ( C|/\\/\\/\\/\\/|  |');
  console.log('  \'-./\\/\\/\\/\\|  |');
  console.log('    \'_________\'');
  console.log('     \'-------\'' + colors.reset);
  console.log('\n');
  
  // Overall status
  if (results.failed === 0) {
    console.log(`${colors.bold}${colors.green}✅ ALL TESTS PASSED!${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}❌ ${results.failed} TEST${results.failed !== 1 ? 'S' : ''} FAILED!${colors.reset}`);
  }
  
  console.log('\n');
}

// Default export for CommonJS
module.exports = { printDashboard };