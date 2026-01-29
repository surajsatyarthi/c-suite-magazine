const fs = require('fs');

const files = [
  'hooks/useAdTrigger.ts',
  'store/adStore.ts',
  'components/AdInterstitialV2.tsx',
  'components/Ad.tsx'
];

console.log('═══════════════════════════════════════════════════════');
console.log('CODE VERIFICATION TEST RESULTS');
console.log('═══════════════════════════════════════════════════════\n');

let allPassed = true;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    console.log('✅', file);
    
    // Check for session storage implementation
    if (file.includes('useAdTrigger')) {
      const hasSessionCheck = content.includes('sessionStorage.getItem');
      const hasSessionSet = content.includes('sessionStorage.setItem');
      const hasSessionKey = content.includes('popup-ad-shown-session');
      const passed = hasSessionCheck && hasSessionSet && hasSessionKey;
      console.log('   → Session persistence:', passed ? '✅ PASS' : '❌ FAIL');
      if (!passed) allPassed = false;
    }
    
    // Check for pause state
    if (file.includes('AdInterstitialV2')) {
      const hasPauseState = content.includes('isPaused');
      const hasHoverHandlers = content.includes('onMouseEnter') && content.includes('onMouseLeave');
      const hasCondition = content.includes('|| isPaused');
      const passed = hasPauseState && hasHoverHandlers && hasCondition;
      console.log('   → Pause on hover:', passed ? '✅ PASS' : '❌ FAIL');
      if (!passed) allPassed = false;
    }
    
    // Check for optimized query
    if (file.endsWith('Ad.tsx') && !file.includes('AdInterstitial')) {
      const hasCoalesce = content.includes('coalesce');
      const hasEnvVar = content.includes('process.env.NEXT_PUBLIC_FALLBACK_AD_ID');
      const hasRevalidate = content.includes('revalidate');
      const hasFallbackParam = content.includes('fallbackId:');
      
      console.log('   → Optimized query (coalesce):', hasCoalesce ? '✅ PASS' : '❌ FAIL');
      console.log('   → Env variable fallback:', hasEnvVar ? '✅ PASS' : '❌ FAIL');
      console.log('   → Cache revalidation:', hasRevalidate ? '✅ PASS' : '❌ FAIL');
      console.log('   → Fallback parameter:', hasFallbackParam ? '✅ PASS' : '❌ FAIL');
      
      if (!hasCoalesce || !hasEnvVar || !hasRevalidate) allPassed = false;
    }
    
    console.log('');
    
  } catch (error) {
    console.log('❌', file, '- Error:', error.message);
    allPassed = false;
  }
});

// Check env file
console.log('Checking .env.local...');
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const hasEnvVar = envContent.includes('NEXT_PUBLIC_FALLBACK_AD_ID');
  const hasCorrectValue = envContent.includes('clNGIHR7teKIrj4L6FqRKA');
  console.log('✅ .env.local');
  console.log('   → NEXT_PUBLIC_FALLBACK_AD_ID:', hasEnvVar ? '✅ PASS' : '❌ FAIL');
  console.log('   → Correct value (Brabus ID):', hasCorrectValue ? '✅ PASS' : '❌ FAIL');
  if (!hasEnvVar) allPassed = false;
} catch (error) {
  console.log('❌ .env.local - Error:', error.message);
  allPassed = false;
}

console.log('\n═══════════════════════════════════════════════════════');
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - Code is ready for testing');
} else {
  console.log('❌ SOME CHECKS FAILED - Review issues above');
}
console.log('═══════════════════════════════════════════════════════\n');

process.exit(allPassed ? 0 : 1);
