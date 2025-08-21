// Ethiopian Date Converter Class
class EthiopianDateConverter {
    static _startDayOfEthiopian(year) {
        const newYearDay = Math.floor(year / 100) - Math.floor(year / 400) - 4;
        if ((year - 1) % 4 === 3) {
            return newYearDay + 1;
        }
        return newYearDay;
    }

    static toGregorian(year, month, date) {
        const inputs = [year, month, date];
        if (inputs.includes(0) || inputs.some(data => typeof data !== 'number')) {
            throw new Error("Malformed input can't be converted.");
        }

        const newYearDay = this._startDayOfEthiopian(year);
        let gregorianYear = year + 7;
        const gregorianMonths = [0, 30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31, 30];
        
        const nextYear = gregorianYear + 1;
        if ((nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0) {
            gregorianMonths[6] = 29;
        }

        let until = ((month - 1) * 30) + date;
        if (until <= 37 && year <= 1575) {
            until += 28;
            gregorianMonths[0] = 31;
        } else {
            until += newYearDay - 1;
        }

        if ((year - 1) % 4 === 3) {
            until += 1;
        }

        let m = 0;
        let gregorianDate = until;
        
        for (let i = 0; i < gregorianMonths.length; i++) {
            if (until <= gregorianMonths[i]) {
                m = i;
                gregorianDate = until;
                break;
            } else {
                m = i;
                until -= gregorianMonths[i];
            }
        }

        if (m > 4) {
            gregorianYear += 1;
        }

        const order = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const gregorianMonth = order[m];

        return new Date(gregorianYear, gregorianMonth - 1, gregorianDate);
    }

    static toEthiopian(year, month, date) {
        const inputs = [year, month, date];
        if (inputs.includes(0) || inputs.some(data => typeof data !== 'number')) {
            throw new Error("Malformed input can't be converted.");
        }

        if (month === 10 && date >= 5 && date <= 14 && year === 1582) {
            throw new Error("Invalid Date between 5-14 October 1582.");
        }

        const gregorianMonths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const ethiopianMonths = [0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5, 30, 30, 30, 30];

        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
            gregorianMonths[2] = 29;
        }

        let ethiopianYear = year - 8;

        if (ethiopianYear % 4 === 3) {
            ethiopianMonths[10] = 6;
        } else {
            ethiopianMonths[10] = 5;
        }

        const newYearDay = this._startDayOfEthiopian(year - 8);

        let until = 0;
        for (let i = 1; i < month; i++) {
            until += gregorianMonths[i];
        }
        until += date;

        let tahissas;
        if (ethiopianYear % 4 === 0) {
            tahissas = 26;
        } else {
            tahissas = 25;
        }

        if (year < 1582) {
            ethiopianMonths[1] = 0;
            ethiopianMonths[2] = tahissas;
        } else if (until <= 277 && year === 1582) {
            ethiopianMonths[1] = 0;
            ethiopianMonths[2] = tahissas;
        } else {
            tahissas = newYearDay - 3;
            ethiopianMonths[1] = tahissas;
        }

        let m = 0;
        let ethiopianDate = 0;
        
        for (m = 1; m < ethiopianMonths.length; m++) {
            if (until <= ethiopianMonths[m]) {
                if (m === 1 || ethiopianMonths[m] === 0) {
                    ethiopianDate = until + (30 - tahissas);
                } else {
                    ethiopianDate = until;
                }
                break;
            } else {
                until -= ethiopianMonths[m];
            }
        }

        if (m > 10) {
            ethiopianYear += 1;
        }

        const order = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4];
        const ethiopianMonth = order[m];

        return { year: ethiopianYear, month: ethiopianMonth, day: ethiopianDate };
    }
}

// Main Calendar Application Class
class CalendarApp {
    constructor() {
        this.mode = 'eth-to-greg'; // 'eth-to-greg' or 'greg-to-eth'
        this.ethiopianMonths = [
            'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
            'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasse', 'Pagume'
        ];
        this.gregorianMonths = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.init();
    }

    init() {
        this.populateYears();
        this.populateMonths();
        this.bindEvents();
        this.setCurrentDate();
    }

    bindEvents() {
        const yearSelect = document.getElementById('input-year');
        const monthSelect = document.getElementById('input-month');
        const daySelect = document.getElementById('input-day');
        const swapButton = document.getElementById('swap-mode');
        const toggleOptions = document.querySelectorAll('.toggle-option');

        yearSelect.addEventListener('change', () => {
            this.updateDays();
            this.convert();
        });

        monthSelect.addEventListener('change', () => {
            this.updateDays();
            this.convert();
        });

        daySelect.addEventListener('change', () => {
            this.convert();
        });

        swapButton.addEventListener('click', () => {
            this.switchMode();
        });

        toggleOptions.forEach(option => {
            option.addEventListener('click', () => {
                const newMode = option.dataset.mode;
                if (newMode !== this.mode) {
                    this.switchMode();
                }
            });
        });
    }

    populateYears() {
        const yearSelect = document.getElementById('input-year');
        yearSelect.innerHTML = '<option value="">Year</option>';
        
        const currentYear = new Date().getFullYear();
        const startYear = this.mode === 'eth-to-greg' ? 1900 : 1900;
        const endYear = this.mode === 'eth-to-greg' ? 2100 : 2100;
        
        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    populateMonths() {
        const monthSelect = document.getElementById('input-month');
        monthSelect.innerHTML = '<option value="">Month</option>';
        
        const months = this.mode === 'eth-to-greg' ? this.ethiopianMonths : this.gregorianMonths;
        
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = `${index + 1}. ${month}`;
            monthSelect.appendChild(option);
        });
    }

    updateDays() {
        const yearSelect = document.getElementById('input-year');
        const monthSelect = document.getElementById('input-month');
        const daySelect = document.getElementById('input-day');
        
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);
        
        daySelect.innerHTML = '<option value="">Day</option>';
        
        if (!year || !month) return;
        
        let maxDays = 30;
        
        if (this.mode === 'eth-to-greg') {
            // Ethiopian calendar logic
            if (month === 13) { // Pagume
                maxDays = ((year % 4) === 3) ? 6 : 5;
            } else {
                maxDays = 30;
            }
        } else {
            // Gregorian calendar logic
            const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            maxDays = daysInMonth[month - 1];
            
            if (month === 2 && this.isLeapYear(year)) {
                maxDays = 29;
            }
        }
        
        for (let day = 1; day <= maxDays; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        }
    }

    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    convert() {
        const yearSelect = document.getElementById('input-year');
        const monthSelect = document.getElementById('input-month');
        const daySelect = document.getElementById('input-day');
        const errorMessage = document.getElementById('error-message');
        const result = document.getElementById('result');
        const resultDate = document.getElementById('result-date');
        const resultLabel = document.getElementById('result-label');
        
        const year = parseInt(yearSelect.value);
       const month = parseInt(monthSelect.value);
       const day = parseInt(daySelect.value);
       
       // Clear previous error
       errorMessage.style.display = 'none';
       
       if (!year || !month || !day) {
           result.style.display = 'none';
           return;
       }
       
       try {
           if (this.mode === 'eth-to-greg') {
               const gregorianDate = EthiopianDateConverter.toGregorian(year, month, day);
               const options = { 
                   weekday: 'long', 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
               };
               resultDate.textContent = gregorianDate.toLocaleDateString('en-US', options);
               resultLabel.textContent = 'Gregorian Date';
           } else {
               const ethiopianDate = EthiopianDateConverter.toEthiopian(year, month, day);
               const monthName = this.ethiopianMonths[ethiopianDate.month - 1];
               resultDate.textContent = `${monthName} ${ethiopianDate.day}, ${ethiopianDate.year}`;
               resultLabel.textContent = 'Ethiopian Date';
           }
           
           result.style.display = 'block';
       } catch (error) {
           errorMessage.textContent = error.message;
           errorMessage.style.display = 'block';
           result.style.display = 'none';
       }
   }

   switchMode() {
       this.mode = this.mode === 'eth-to-greg' ? 'greg-to-eth' : 'eth-to-greg';
       
       // Update toggle buttons
       document.querySelectorAll('.toggle-option').forEach(option => {
           option.classList.toggle('active', option.dataset.mode === this.mode);
       });
       
       // Update card titles and icons
       const inputCard = document.getElementById('input-card');
       const outputCard = document.getElementById('output-card');
       const inputTitle = inputCard.querySelector('.card-title');
       const outputTitle = outputCard.querySelector('.card-title');
       
       if (this.mode === 'eth-to-greg') {
           inputTitle.textContent = 'Ethiopian Date';
           outputTitle.textContent = 'Gregorian Date';
       } else {
           inputTitle.textContent = 'Gregorian Date';
           outputTitle.textContent = 'Ethiopian Date';
       }
       
       // Clear selections and repopulate
       document.getElementById('input-year').value = '';
       document.getElementById('input-month').value = '';
       document.getElementById('input-day').value = '';
       document.getElementById('result').style.display = 'none';
       document.getElementById('error-message').style.display = 'none';
       
       this.populateYears();
       this.populateMonths();
       this.updateDays();
   }

   setCurrentDate() {
       const today = new Date();
       const yearSelect = document.getElementById('input-year');
       const monthSelect = document.getElementById('input-month');
       const daySelect = document.getElementById('input-day');
       
       if (this.mode === 'eth-to-greg') {
           // Convert current Gregorian date to Ethiopian
           try {
               const ethiopianDate = EthiopianDateConverter.toEthiopian(
                   today.getFullYear(), 
                   today.getMonth() + 1, 
                   today.getDate()
               );
               
               yearSelect.value = ethiopianDate.year;
               monthSelect.value = ethiopianDate.month;
               this.updateDays();
               
               setTimeout(() => {
                   daySelect.value = ethiopianDate.day;
                   this.convert();
               }, 100);
           } catch (error) {
               // If conversion fails, set a default Ethiopian date
               yearSelect.value = 2017; // Current Ethiopian year approximately
               monthSelect.value = 1;
               this.updateDays();
               setTimeout(() => {
                   daySelect.value = 1;
                   this.convert();
               }, 100);
           }
       } else {
           // Set current Gregorian date
           yearSelect.value = today.getFullYear();
           monthSelect.value = today.getMonth() + 1;
           this.updateDays();
           
           setTimeout(() => {
               daySelect.value = today.getDate();
               this.convert();
           }, 100);
       }
   }
}

// Enhanced UI Features
class UIEnhancements {
   static init() {
       this.addKeyboardNavigation();
       this.addTooltips();
       this.addAnimations();
       this.addAccessibility();
   }

   static addKeyboardNavigation() {
       document.addEventListener('keydown', (e) => {
           if (e.ctrlKey && e.key === 'Enter') {
               document.getElementById('swap-mode').click();
           }
       });
   }

   static addTooltips() {
       const tooltips = [
           { selector: '#input-year', text: 'Select the year for conversion' },
           { selector: '#input-month', text: 'Choose the month' },
           { selector: '#input-day', text: 'Pick the day of the month' },
           { selector: '#swap-mode', text: 'Click to switch conversion mode (Ctrl+Enter)' }
       ];

       tooltips.forEach(({ selector, text }) => {
           const element = document.querySelector(selector);
           if (element) {
               element.title = text;
           }
       });
   }

   static addAnimations() {
       // Add stagger animation to form elements
       const formElements = document.querySelectorAll('.form-group');
       formElements.forEach((element, index) => {
           element.style.animationDelay = `${index * 0.1}s`;
           element.classList.add('animate-in');
       });
   }

   static addAccessibility() {
       // Add ARIA labels
       const elements = [
           { id: 'input-year', label: 'Select year for date conversion' },
           { id: 'input-month', label: 'Select month for date conversion' },
           { id: 'input-day', label: 'Select day for date conversion' },
           { id: 'swap-mode', label: 'Switch between Ethiopian to Gregorian and Gregorian to Ethiopian conversion modes' }
       ];

       elements.forEach(({ id, label }) => {
           const element = document.getElementById(id);
           if (element) {
               element.setAttribute('aria-label', label);
           }
       });

       // Add live region for results
       const resultContainer = document.getElementById('result-container');
       resultContainer.setAttribute('aria-live', 'polite');
       resultContainer.setAttribute('aria-atomic', 'true');
   }
}

// Calendar Features Class
class CalendarFeatures {
   static addQuickDateButtons() {
       const quickDates = [
           { label: 'Today', action: 'today' },
           { label: 'New Year', action: 'new-year' }
       ];

       const quickDateContainer = document.createElement('div');
       quickDateContainer.className = 'quick-dates';
       quickDateContainer.innerHTML = `
           <div class="quick-dates-title">Quick Dates</div>
           <div class="quick-dates-buttons">
               ${quickDates.map(date => 
                   `<button class="quick-date-btn" data-action="${date.action}">${date.label}</button>`
               ).join('')}
           </div>
       `;

       const inputCard = document.getElementById('input-card');
       inputCard.appendChild(quickDateContainer);

       // Add event listeners for quick date buttons
       quickDateContainer.addEventListener('click', (e) => {
           if (e.target.classList.contains('quick-date-btn')) {
               this.handleQuickDate(e.target.dataset.action);
           }
       });
   }

   static handleQuickDate(action) {
       const yearSelect = document.getElementById('input-year');
       const monthSelect = document.getElementById('input-month');
       const daySelect = document.getElementById('input-day');
       const app = window.calendarApp;

       let targetDate;
       const today = new Date();

       switch (action) {
           case 'today':
               targetDate = today;
               break;
           case 'new-year':
               if (app.mode === 'eth-to-greg') {
                   // Ethiopian New Year (Meskerem 1)
                   yearSelect.value = 2017; // Current Ethiopian year
                   monthSelect.value = 1;
                   app.updateDays();
                   setTimeout(() => {
                       daySelect.value = 1;
                       app.convert();
                   }, 100);
                   return;
               } else {
                   targetDate = new Date(today.getFullYear(), 0, 1);
               }
               break;
       }

       if (targetDate) {
           if (app.mode === 'eth-to-greg') {
               try {
                   const ethDate = EthiopianDateConverter.toEthiopian(
                       targetDate.getFullYear(),
                       targetDate.getMonth() + 1,
                       targetDate.getDate()
                   );
                   yearSelect.value = ethDate.year;
                   monthSelect.value = ethDate.month;
                   app.updateDays();
                   setTimeout(() => {
                       daySelect.value = ethDate.day;
                       app.convert();
                   }, 100);
               } catch (error) {
                   console.error('Error converting quick date:', error);
               }
           } else {
               yearSelect.value = targetDate.getFullYear();
               monthSelect.value = targetDate.getMonth() + 1;
               app.updateDays();
               setTimeout(() => {
                   daySelect.value = targetDate.getDate();
                   app.convert();
               }, 100);
           }
       }
   }

   static addDateValidation() {
       const yearSelect = document.getElementById('input-year');
       const monthSelect = document.getElementById('input-month');
       const daySelect = document.getElementById('input-day');

       [yearSelect, monthSelect, daySelect].forEach(select => {
           select.addEventListener('change', () => {
               this.validateDate();
           });
       });
   }

   static validateDate() {
       const yearSelect = document.getElementById('input-year');
       const monthSelect = document.getElementById('input-month');
       const daySelect = document.getElementById('input-day');

       const year = parseInt(yearSelect.value);
       const month = parseInt(monthSelect.value);
       const day = parseInt(daySelect.value);

       if (!year || !month || !day) return;

       const app = window.calendarApp;
       let isValid = true;
       let errorMessage = '';

       try {
           if (app.mode === 'eth-to-greg') {
               // Validate Ethiopian date
               if (month === 13) {
                   const maxDays = ((year % 4) === 3) ? 6 : 5;
                   if (day > maxDays) {
                       isValid = false;
                       errorMessage = `Pagume can only have ${maxDays} days in year ${year}`;
                   }
               }
               
               if (isValid) {
                   EthiopianDateConverter.toGregorian(year, month, day);
               }
           } else {
               // Validate Gregorian date
               const testDate = new Date(year, month - 1, day);
               if (testDate.getFullYear() !== year || 
                   testDate.getMonth() !== month - 1 || 
                   testDate.getDate() !== day) {
                   isValid = false;
                   errorMessage = 'Invalid date in Gregorian calendar';
               }
               
               if (isValid) {
                   EthiopianDateConverter.toEthiopian(year, month, day);
               }
           }
       } catch (error) {
           isValid = false;
           errorMessage = error.message;
       }

       // Update UI based on validation
       const selects = [yearSelect, monthSelect, daySelect];
       selects.forEach(select => {
           select.style.borderColor = isValid ? 'var(--border-light)' : 'var(--error-color)';
       });

       if (!isValid && errorMessage) {
           const errorDiv = document.getElementById('error-message');
           errorDiv.textContent = errorMessage;
           errorDiv.style.display = 'block';
       } else {
           document.getElementById('error-message').style.display = 'none';
       }
   }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
   window.calendarApp = new CalendarApp();
   UIEnhancements.init();
   CalendarFeatures.addQuickDateButtons();
   CalendarFeatures.addDateValidation();
   
   // Add micro-interactions
   const cards = document.querySelectorAll('.card');
   cards.forEach(card => {
       card.addEventListener('mouseenter', () => {
           card.style.transform = 'translateY(-8px) scale(1.02)';
       });
       
       card.addEventListener('mouseleave', () => {
           card.style.transform = 'translateY(0) scale(1)';
       });
   });

   // Add loading states for better UX
   const selects = document.querySelectorAll('.form-select');
   selects.forEach(select => {
       select.addEventListener('change', () => {
           select.style.background = 'var(--bg-primary)';
           setTimeout(() => {
               select.style.background = 'var(--bg-secondary)';
           }, 200);
       });
   });

   // Add success animation when conversion is complete
   const observer = new MutationObserver((mutations) => {
       mutations.forEach((mutation) => {
           if (mutation.target.id === 'result' && 
               mutation.target.style.display === 'block') {
               mutation.target.classList.add('pulse');
               setTimeout(() => {
                   mutation.target.classList.remove('pulse');
               }, 2000);
           }
       });
   });

   observer.observe(document.getElementById('result'), {
       attributes: true,
       attributeFilter: ['style']
   });

   console.log('🎉 Ethiopian Calendar Converter loaded successfully!');
});