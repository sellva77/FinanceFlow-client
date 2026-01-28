import { useMemo } from 'react';
import { 
    HiExclamationTriangle, HiLightBulb, HiShieldCheck, HiExclamationCircle,
    HiFire, HiTrophy, HiHandThumbUp, HiArrowTrendingUp, HiArrowTrendingDown, HiBolt 
} from 'react-icons/hi2';

export const useAnalyticsInsights = (analytics, formatCurrency, year) => {
    return useMemo(() => {
        if (!analytics) return { warnings: [], celebrations: [], tips: [], stats: {} };
        
        const warnings = [];
        const celebrations = [];
        const tips = [];
        const stats = {};
        
        const yearTotal = analytics.yearTotal || {};
        const monthly = analytics.monthly || [];
        const topCategories = analytics.topCategories || [];
        const yearly = analytics.yearly || [];
        
        // === BASIC STATS ===
        const avgMonthlyIncome = yearTotal.income ? yearTotal.income / 12 : 0;
        const avgMonthlyExpense = yearTotal.expense ? yearTotal.expense / 12 : 0;
        const savingsRate = yearTotal.income ? ((yearTotal.savings / yearTotal.income) * 100) : 0;
        
        stats.avgMonthlyIncome = avgMonthlyIncome;
        stats.avgMonthlyExpense = avgMonthlyExpense;
        stats.savingsRate = savingsRate;
        
        // Find current month data
        const currentMonth = new Date().getMonth() + 1;
        const currentMonthData = monthly.find(m => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return monthNames.indexOf(m.month) + 1 === currentMonth;
        });
        
        // Find previous month data
        const prevMonthData = monthly.find(m => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return monthNames.indexOf(m.month) + 1 === currentMonth - 1;
        });
        
        // === EXPENSE VS INCOME ANALYSIS ===
        if (yearTotal.expense > yearTotal.income) {
            warnings.push({
                type: 'critical',
                icon: HiExclamationTriangle,
                title: 'Spending Exceeds Income!',
                message: `You've spent ${formatCurrency(yearTotal.expense - yearTotal.income)} more than you earned this year. This is unsustainable.`,
                action: 'Review your biggest spending categories and cut unnecessary expenses.'
            });
        }
        
        // === SAVINGS RATE ANALYSIS ===
        if (savingsRate >= 30) {
            celebrations.push({
                type: 'excellent',
                icon: HiTrophy,
                title: 'Outstanding Savings Rate!',
                message: `Amazing! You're saving ${savingsRate.toFixed(1)}% of your income. This puts you in the top tier of savers.`,
                highlight: `${formatCurrency(yearTotal.savings)} saved this year`
            });
        } else if (savingsRate >= 20) {
            celebrations.push({
                type: 'good',
                icon: HiHandThumbUp,
                title: 'Good Savings Habit!',
                message: `You're saving ${savingsRate.toFixed(1)}% of your income. That's solid financial discipline!`,
                highlight: `${formatCurrency(yearTotal.savings)} saved`
            });
        } else if (savingsRate >= 10) {
            tips.push({
                type: 'improvement',
                icon: HiLightBulb,
                title: 'Room for Improvement',
                message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% for better financial security.`,
                action: `Try to save an extra ${formatCurrency((yearTotal.income * 0.2) - yearTotal.savings)} per year.`
            });
        } else if (savingsRate > 0) {
            warnings.push({
                type: 'warning',
                icon: HiExclamationCircle,
                title: 'Low Savings Rate',
                message: `You're only saving ${savingsRate.toFixed(1)}% of income. This leaves you vulnerable to emergencies.`,
                action: 'Start with small cuts - cancel unused subscriptions, cook at home more often.'
            });
        } else if (savingsRate <= 0) {
            warnings.push({
                type: 'critical',
                icon: HiFire,
                title: 'No Savings This Year!',
                message: `You're not saving any money. In fact, you're spending more than you earn.`,
                action: 'Create a budget immediately and track every expense.'
            });
        }
        
        // === TOP SPENDING CATEGORY ANALYSIS ===
        if (topCategories.length > 0) {
            const topCategory = topCategories[0];
            const topCategoryPercent = yearTotal.expense ? ((topCategory.total / yearTotal.expense) * 100) : 0;
            
            if (topCategoryPercent > 40) {
                warnings.push({
                    type: 'warning',
                    icon: HiExclamationCircle,
                    title: `"${topCategory._id}" Dominates Spending`,
                    message: `${topCategoryPercent.toFixed(1)}% of all expenses go to ${topCategory._id}. That's ${formatCurrency(topCategory.total)} this year!`,
                    action: 'Consider if all these expenses are necessary or if you can reduce them.'
                });
            } else if (topCategoryPercent > 25) {
                tips.push({
                    type: 'info',
                    icon: HiLightBulb,
                    title: `Highest Spending: ${topCategory._id}`,
                    message: `${topCategoryPercent.toFixed(1)}% of expenses (${formatCurrency(topCategory.total)}) - this is your biggest spending area.`,
                    action: 'Review if there are ways to optimize this category.'
                });
            }
            
            // Check for potential unnecessary spending categories
            const potentialWasteCategories = ['Entertainment', 'Shopping', 'Dining', 'Food', 'Subscriptions', 'Online Shopping'];
            topCategories.forEach((cat, idx) => {
                if (potentialWasteCategories.some(w => cat._id.toLowerCase().includes(w.toLowerCase()))) {
                    const catPercent = yearTotal.expense ? ((cat.total / yearTotal.expense) * 100) : 0;
                    if (catPercent > 15 && idx < 3) {
                        tips.push({
                            type: 'suggestion',
                            icon: HiBolt,
                            title: `Watch "${cat._id}" Spending`,
                            message: `You've spent ${formatCurrency(cat.total)} (${catPercent.toFixed(1)}%) on ${cat._id}. This category often has hidden savings potential.`,
                            action: `Try a "no-spend week" challenge for ${cat._id}.`
                        });
                    }
                }
            });
        }
        
        // === MONTH-OVER-MONTH ANALYSIS ===
        if (currentMonthData && prevMonthData) {
            const expenseChange = currentMonthData.expense - prevMonthData.expense;
            const expenseChangePercent = prevMonthData.expense ? ((expenseChange / prevMonthData.expense) * 100) : 0;
            
            if (expenseChangePercent > 30) {
                warnings.push({
                    type: 'warning',
                    icon: HiArrowTrendingUp,
                    title: 'Spending Spike Detected!',
                    message: `This month's expenses are ${expenseChangePercent.toFixed(0)}% higher than last month (${formatCurrency(expenseChange)} more).`,
                    action: 'Review recent transactions to identify the cause.'
                });
            } else if (expenseChangePercent < -20) {
                celebrations.push({
                    type: 'good',
                    icon: HiArrowTrendingDown,
                    title: 'Great Spending Reduction!',
                    message: `You spent ${Math.abs(expenseChangePercent).toFixed(0)}% less this month compared to last month!`,
                    highlight: `${formatCurrency(Math.abs(expenseChange))} saved`
                });
            }
        }
        
        // === MONTHLY PATTERN ANALYSIS ===
        const monthsWithNegativeSavings = monthly.filter(m => m.savings < 0);
        if (monthsWithNegativeSavings.length > 3) {
            warnings.push({
                type: 'critical',
                icon: HiFire,
                title: 'Frequent Overspending!',
                message: `You overspent in ${monthsWithNegativeSavings.length} months this year: ${monthsWithNegativeSavings.map(m => m.month).join(', ')}.`,
                action: 'Set up a monthly budget and stick to it.'
            });
        } else if (monthsWithNegativeSavings.length > 0) {
            tips.push({
                type: 'info',
                icon: HiLightBulb,
                title: 'Some Overspending Months',
                message: `You overspent in ${monthsWithNegativeSavings.length} month(s): ${monthsWithNegativeSavings.map(m => m.month).join(', ')}.`,
                action: 'Plan ahead for high-expense months.'
            });
        }
        
        // === FIND BEST AND WORST MONTHS ===
        if (monthly.length > 0) {
            const bestMonth = [...monthly].sort((a, b) => b.savings - a.savings)[0];
            const worstMonth = [...monthly].sort((a, b) => a.savings - b.savings)[0];
            
            stats.bestMonth = bestMonth;
            stats.worstMonth = worstMonth;
            
            if (bestMonth.savings > 0) {
                celebrations.push({
                    type: 'highlight',
                    icon: HiTrophy,
                    title: `Best Month: ${bestMonth.month}`,
                    message: `You saved ${formatCurrency(bestMonth.savings)} in ${bestMonth.month} - your best month this year!`,
                    highlight: 'Try to replicate this success'
                });
            }
        }
        
        // === YEAR OVER YEAR COMPARISON ===
        if (yearly.length >= 2) {
            const currentYearData = yearly.find(y => y.year === year);
            const prevYearData = yearly.find(y => y.year === year - 1);
            
            if (currentYearData && prevYearData) {
                const savingsChange = currentYearData.savings - prevYearData.savings;
                const expenseChange = currentYearData.expense - prevYearData.expense;
                
                if (savingsChange > 0 && savingsChange > prevYearData.savings * 0.1) {
                    celebrations.push({
                        type: 'excellent',
                        icon: HiShieldCheck,
                        title: 'Improved from Last Year!',
                        message: `Your savings increased by ${formatCurrency(savingsChange)} compared to ${year - 1}.`,
                        highlight: 'Keep up the momentum!'
                    });
                } else if (savingsChange < 0 && Math.abs(savingsChange) > prevYearData.savings * 0.1) {
                    warnings.push({
                        type: 'warning',
                        icon: HiArrowTrendingDown,
                        title: 'Savings Dropped from Last Year',
                        message: `Your savings decreased by ${formatCurrency(Math.abs(savingsChange))} compared to ${year - 1}.`,
                        action: 'Analyze what changed and adjust your spending.'
                    });
                }
                
                if (expenseChange > prevYearData.expense * 0.2) {
                    warnings.push({
                        type: 'warning',
                        icon: HiExclamationCircle,
                        title: 'Expenses Rising vs Last Year',
                        message: `You're spending ${formatCurrency(expenseChange)} more than ${year - 1}. That's a ${((expenseChange / prevYearData.expense) * 100).toFixed(0)}% increase.`,
                        action: 'Make sure this increase is justified (inflation, life changes, etc.)'
                    });
                }
            }
        }
        
        // === GENERAL TIPS ===
        if (tips.length === 0 && warnings.length === 0) {
            tips.push({
                type: 'info',
                icon: HiLightBulb,
                title: 'Keep Tracking!',
                message: 'Consistent tracking is the first step to financial awareness.',
                action: 'Log all your transactions to get better insights.'
            });
        }
        
        return { warnings, celebrations, tips, stats };
    }, [analytics, formatCurrency, year]);
};
