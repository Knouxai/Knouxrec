// Quick system verification test
console.log("🧪 KNOUX REC - System Verification Test");

// Test 1: Check if all main services are accessible
try {
  console.log("✅ Testing feedbackService...");
  if (typeof window !== "undefined" && window.feedbackService) {
    window.feedbackService.info("System verification test running...");
    console.log("✅ FeedbackService: OK");
  } else {
    console.log("⚠️ FeedbackService: Not available (normal in Node.js)");
  }
} catch (error) {
  console.log("❌ FeedbackService: Error -", error.message);
}

// Test 2: Check Canvas API support
try {
  console.log("✅ Testing Canvas API...");
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      console.log("✅ Canvas API: OK");
    } else {
      console.log("❌ Canvas API: Not supported");
    }
  } else {
    console.log("⚠️ Canvas API: Not available (normal in Node.js)");
  }
} catch (error) {
  console.log("❌ Canvas API: Error -", error.message);
}

// Test 3: Check Audio Context support
try {
  console.log("✅ Testing Audio Context...");
  if (typeof window !== "undefined") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      console.log("✅ Audio Context: OK");
    } else {
      console.log("❌ Audio Context: Not supported");
    }
  } else {
    console.log("⚠️ Audio Context: Not available (normal in Node.js)");
  }
} catch (error) {
  console.log("❌ Audio Context: Error -", error.message);
}

// Test 4: Check system tester
try {
  console.log("✅ Testing system components...");
  if (typeof window !== "undefined" && window.testKnouxSystem) {
    console.log("✅ System Tester: Available");
    console.log("🚀 Run testKnouxSystem() in browser console for full test");
  } else {
    console.log("⚠️ System Tester: Not available (normal in Node.js)");
  }
} catch (error) {
  console.log("❌ System Tester: Error -", error.message);
}

console.log(
  "🎯 Verification complete! Check browser console for full test results.",
);
console.log("💡 To run full system test in browser: testKnouxSystem()");
console.log("💡 To run quick test in browser: quickTestKnoux()");
