import chalk from 'chalk'

export interface TestResults {
  total: number
  passed: number
  failed: number
  skipped: number
  duration: number
}

/**
 * Print a formatted test summary with color-coded output
 */
export function printTestSummary(results: TestResults) {
  console.log('\n' + chalk.bold('═'.repeat(60)))
  console.log(chalk.bold('  TEST SUMMARY'))
  console.log(chalk.bold('═'.repeat(60)) + '\n')

  console.log(`  Total Tests:     ${chalk.cyan(results.total)}`)
  console.log(`  ${chalk.green('✓')} Passed:        ${chalk.green(results.passed)}`)

  if (results.failed > 0) {
    console.log(`  ${chalk.red('✗')} Failed:        ${chalk.red.bold(results.failed)}`)
  }

  if (results.skipped > 0) {
    console.log(`  ${chalk.yellow('○')} Skipped:       ${chalk.yellow(results.skipped)}`)
  }

  console.log(`  Duration:        ${chalk.gray(results.duration + 'ms')}`)
  console.log('\n' + chalk.bold('═'.repeat(60)))

  if (results.failed === 0) {
    console.log(chalk.green.bold('\n  ✓ ALL TESTS PASSED!\n'))
  }
  else {
    console.log(chalk.red.bold('\n  ✗ TESTS FAILED\n'))
  }
}
