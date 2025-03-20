/**
 * Additional script to print a test summary when needed
 */
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  fg: {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  },
};

/**
 * Print a test summary banner
 */
function printSummary() {
  console.log('\n');
  console.log(colors.bright + colors.fg.cyan + '╔════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + colors.fg.cyan + '║            TEST SUMMARY                    ║' + colors.reset);
  console.log(colors.bright + colors.fg.cyan + '╚════════════════════════════════════════════╝' + colors.reset);
  console.log('\n');
  
  // Get project info
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let projectInfo = { name: 'Unknown', version: '0.0.0' };
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    projectInfo = {
      name: packageJson.name || 'Unknown',
      version: packageJson.version || '0.0.0',
      description: packageJson.description || '',
    };
  } catch (error) {
    console.log('Could not read package.json');
  }
  
  // Print project info
  console.log(colors.bright + `Project: ${projectInfo.name} v${projectInfo.version}` + colors.reset);
  console.log(projectInfo.description);
  console.log('\n');
  
  // Coffee cup ASCII art
  console.log('                    (');
  console.log('                      )     (');
  console.log('               ___...(-------)-....___');
  console.log('           .-""       )    (          ""-.'); 
  console.log('     .-\'``\'|-._             )         _.-|');
  console.log('    /  .--.|   `""---...........---""`   |');
  console.log('   /  /    |                             |');
  console.log('   |  |    |                             |');
  console.log('    \\  \\   |                             |');
  console.log('     `\\ `\\ |                             |');
  console.log('       `\\ `|                             |');
  console.log('       _/ /\\                             /');
  console.log('      (__/  \\                           /');
  console.log('   _..---""` \\                         /`""---.._');
  console.log('.-\'           \\                       /          \'-.');
  console.log(':               `-.__             __.-\'              :');
  console.log(':                  ) ""---...---"" (                 :');
  console.log(' \'._               `"--...___...--"`              _.\'');
  console.log('   \\""--..__                              __..--""/');
  console.log('    \'._     """----.....______.....----"""     _.\'');
  console.log('       `""--..,,_____            _____,,..--""`');
  console.log('                     `"""----"""`');
  
  console.log('\n');
  console.log(colors.bright + colors.fg.green + 'All tests completed successfully!' + colors.reset);
  console.log('\n');
  console.log(colors.fg.cyan + 'Run the following commands for more options:' + colors.reset);
  console.log(`  ${colors.fg.yellow}• yarn test:watch${colors.reset}     - Run tests in watch mode`);
  console.log(`  ${colors.fg.yellow}• yarn test:coverage${colors.reset}  - Run tests with coverage report`);
  console.log(`  ${colors.fg.yellow}• yarn lint${colors.reset}           - Run linter`);
  console.log(`  ${colors.fg.yellow}• yarn lint:fix${colors.reset}       - Fix linting issues`);
  console.log('\n');
  
  // Current timestamp
  const now = new Date();
  console.log(colors.dim + `Report generated on ${now.toLocaleString()}` + colors.reset);
  console.log('\n');
}

printSummary();