# Academic Dashboard - Debugging & Modification Guide

## 🚀 Overview

The Academic Dashboard has been enhanced with comprehensive debugging capabilities and data-responsive calculations. This guide helps you debug issues and modify the dashboard easily.

## 🔧 Debugging Features

### 1. **Automatic Debug Mode**

```javascript
// Automatically enabled in development
const DEBUG_MODE = process.env.NODE_ENV === "development";

// Check browser console for detailed logs like:
// 📊 [AcademicOverview] Data Arrays: { students: 150, courses: 25, ... }
// 📊 [AcademicOverview] Pass Rate: { total: 300, passed: 240, rate: 80 }
```

### 2. **Data Quality Validation**

Every calculation includes data validation:

```javascript
// Safe calculations prevent crashes
const rate = safePercentage(numerator, denominator, fallback);
const average = safeDivide(total, count, defaultValue);
```

### 3. **Comprehensive Logging**

Each metric logs its calculation details:

```javascript
debugLog("Metric Name", {
  inputData: data.length,
  calculatedValue,
  additionalInfo,
});
```

## 🛠 Utility Functions Available

### Core Utilities

- `safeDivide(a, b, fallback)` - Prevents division by zero
- `safePercentage(a, b, fallback)` - Safe percentage calculation
- `getGradePoints(grade)` - Convert grades to GPA points
- `isToday(dateString)` - Check if date is today
- `isIntakeActive(intake)` - Check if intake is currently active

## 📊 Dashboard Statistics Structure

### Student Academic Performance

```javascript
passRate: calculated from results data
averageGPA: real-time GPA calculation
atRiskStudents: students with GPA < 2.0
topPerformers: students with GPA > 3.5
```

### Attendance Tracking

```javascript
avgAttendanceRate: overall attendance percentage
lowAttendanceAlerts: students below 75% attendance
attendancePerformanceCorr: correlation between attendance and grades
weeklyAbsenceTrend: absence rate trend
```

### Assessment & Exam Insights

```javascript
resultSubmissionProgress: modules with submitted results
assessmentWeightage: coursework vs exam distribution
pendingGradingItems: modules awaiting grade submission
```

## 🔍 Debugging Common Issues

### Issue: "Stats showing zero"

**Cause**: Missing or invalid data
**Debug**: Check console for data quality logs

```javascript
// Look for logs like:
// 📊 [AcademicOverview] Data Arrays: { students: 0, results: 0 }
```

### Issue: "Performance metrics incorrect"

**Cause**: Grade data format issues
**Debug**: Verify grade values in results array

```javascript
// Grades should be: 'A', 'B', 'C', 'D', 'F'
// Check: Results with invalid grades filtered out
```

### Issue: "Charts not displaying data"

**Cause**: Missing enrollment dates or department IDs
**Debug**: Check enrollment/department data processing logs

## ⚙️ Adding New Metrics

### Step 1: Add to dashboardStats

```javascript
newMetric: (() => {
  if (!dataSource?.length) return 0;

  const calculation = processData(dataSource);

  debugLog("New Metric", {
    sourceData: dataSource.length,
    result: calculation
  });

  return calculation;
})(),
```

### Step 2: Add StatsCard in UI

```javascript
<StatsCard
  title="New Metric"
  value={dashboardStats.newMetric}
  icon={<YourIcon />}
  color="blue.500"
/>
```

### Step 3: Test with Debug Mode

1. Set `NODE_ENV=development`
2. Check browser console for your debug logs
3. Verify calculation logic with sample data

## 🧪 Testing Tools

### Built-in Debugger

```javascript
import { dashboardDebugger } from "../utils/academicDashboardDebug";

// Test data quality
const debugInfo = dashboardDebugger(students, results, attendance);
console.log(debugInfo.recommendations);
```

### Performance Analyzer

```javascript
import { performanceAnalyzer } from "../utils/academicDashboardDebug";

// Analyze academic performance patterns
const insights = performanceAnalyzer(students, results);
console.log(insights.insights);
```

### Quick Test Function

```javascript
import { testDashboardWithSampleData } from "../utils/academicDashboardDebug";

// Run with sample data
testDashboardWithSampleData();
```

## 📈 Data Flow Architecture

```
Academic Store (Zustand)
    ↓
Data Fetching (useEffect)
    ↓
Utility Functions (safeDivide, etc.)
    ↓
Dashboard Statistics Calculation
    ↓
Debug Logging (if DEBUG_MODE)
    ↓
Chart Data Processing
    ↓
UI Rendering (StatsCards, Charts)
```

## 🚨 Error Handling

### Automatic Fallbacks

- Missing data arrays default to empty arrays `[]`
- Invalid calculations return `0` or default values
- Date parsing errors are logged and handled gracefully
- Division by zero prevented with `safeDivide()`

### Error Logging

All errors are logged with context:

```javascript
debugLog("Error Context", {
  error: error.message,
  data: problematicData,
});
```

## 🔄 Real-time Updates

The dashboard automatically updates when:

- New students are added to the store
- Academic results are submitted
- Attendance records are updated
- Course assignments change

All calculations are reactive to data changes through Zustand store updates.

## 📝 Modification Checklist

When modifying the dashboard:

- [ ] Add proper data validation (`?.length` checks)
- [ ] Use utility functions (`safeDivide`, `safePercentage`)
- [ ] Add debug logging for new calculations
- [ ] Test with both empty and populated data
- [ ] Verify calculations make sense with sample data
- [ ] Check console logs in development mode
- [ ] Add appropriate fallback values

## 🆘 Quick Debug Commands

Run these in browser console during development:

```javascript
// Check current data state
console.log("Dashboard Debug:", window.debugDashboard);

// Test with sample data
import("./utils/academicDashboardDebug").then((d) =>
  d.testDashboardWithSampleData()
);

// Analyze current performance
import("./utils/academicDashboardDebug").then((d) =>
  console.log(d.performanceAnalyzer(students, results))
);
```

---

## 💡 Pro Tips

1. **Always check console first** - Most issues are logged with helpful context
2. **Use sample data** - Test calculations with known values first
3. **Verify data structure** - Ensure your data matches expected format
4. **Check network requests** - Academic store might be loading data
5. **Debug incrementally** - Add one metric at a time and test

Happy debugging! 🎉
