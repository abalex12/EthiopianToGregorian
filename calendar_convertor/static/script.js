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

// Application State
class CalendarApp {
    constructor() {
        this.currentMode = 'eth-to-greg';
        this.isConverting = false;
        
        this.ethiopianMonths = [
            { latin: 'Meskerem', amharic: 'መስከረም', gregEquiv: 'Sep 11 - Oct 10' },
            { latin: 'Tikimt', amharic: 'ጥቅምት', gregEquiv: 'Oct 11 - Nov 9' },
            { latin: 'Hidar', amharic: 'ኅዳር', gregEquiv: 'Nov 10 - Dec 9' },
            { latin: 'Tahsas', amharic: 'ታኅሳስ', gregEquiv: 'Dec 10 - Jan 8' },
            { latin: 'Tir', amharic: 'ጥር', gregEquiv: 'Jan 9 - Feb 7' },
            { latin: 'Yekatit', amharic: 'የካቲት', gregEquiv: 'Feb 8 - Mar 9' },
            { latin: 'Megabit', amharic: 'መጋቢት', gregEquiv: 'Mar 10 - Apr 8' },
            { latin: 'Miazia', amharic: 'ሚያዝያ', gregEquiv: 'Apr 9 - May 8' },
            { latin: 'Ginbot', amharic: 'ግንቦት', gregEquiv: 'May 9 - Jun 7' },
            { latin: 'Sene', amharic: 'ሰኔ', gregEquiv: 'Jun 8 - Jul 7' },
            { latin: 'Hamle', amharic: 'ሐምሌ', gregEquiv: 'Jul 8 - Aug 6' },
            { latin: 'Nehasse', amharic: 'ነሐሴ', gregEquiv: 'Aug 7 - Sep 5' },
            { latin: 'Pagume', amharic: 'ጳጉሜ', gregEquiv: 'Sep 6 - Sep 10/11' }
        ];

        this.gregorianMonths = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        this.ethiopianWeekdays = [
            { latin: 'Ehud', amharic: 'እሑድ' },
            { latin: 'Segno', amharic: 'ሰኞ' },
            { latin: 'Maksegno', amharic: 'ማክሰኞ' },
            { latin: 'Rebue', amharic: 'ረቡዕ' },
            { latin: 'Hamus', amharic: 'ሐሙስ' },
            { latin: 'Arb', amharic: 'ዓርብ' },
            { latin: 'Kidame', amharic: 'ቅዳሜ' }
        ];

        this.amharicNumbers = [
            '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱', '፲',
            '፲፩', '፲፪', '፲፫', '፲፬', '፲፭', '፲፮', '፲፯', '፲፰', '፲፱', '፳',
            '፳፩', '፳፪', '፳፫', '፳፬', '፳፭', '፳፮', '፳፯', '፳፰', '፳፱', '፴'
        ];

        this.holidays = [
        {
            name: 'Ethiopian New Year',
            amharic: 'እንቁጣጣሽ',
            date: 'Meskerem 1 • September 11/12',
            type: 'national',
            description: 'Celebration of the new year with flowers, traditional foods, and family gatherings'
        },
        {
            name: 'Finding of the True Cross (Meskel)',
            amharic: 'መስቀል',
            date: 'Meskerem 17 • September 27/28',
            type: 'religious',
            description: 'Major Orthodox Christian festival with bonfires (Demera), processions, and Meskel flowers'
        },
        {
            name: 'Ethiopian Christmas (Genna)',
            amharic: 'ገና',
            date: 'Tahsas 29 • January 7',
            type: 'religious',
            description: 'Orthodox Christmas with church services, fasting, and traditional feasts'
        },
        {
            name: 'Epiphany (Timkat)',
            amharic: 'ጥምቀት',
            date: 'Tir 11 • January 19/20',
            type: 'religious',
            description: 'Commemoration of the baptism of Jesus Christ with colorful water ceremonies'
        },
        {
            name: 'Victory of Adwa',
            amharic: 'የዓድዋ ድል',
            date: 'Yekatit 23 • March 2',
            type: 'national',
            description: 'Celebration of the 1896 victory over Italian forces — a symbol of African resistance'
        },
        {
            name: 'Ethiopian Easter (Fasika)',
            amharic: 'ፋሲካ',
            date: 'Variable • March/April',
            type: 'religious',
            description: 'Most important Orthodox Easter with fasting, midnight vigil, and feasts'
        },
        {
            name: 'Patriots\' Victory Day',
            amharic: 'የአርበኞች ድል በዓል',
            date: 'Miazia 27 • May 5',
            type: 'national',
            description: 'Commemorates Ethiopia’s liberation from Italian occupation in 1941'
        },
        {
            name: 'Ashenda',
            amharic: 'አሸንዳ',
            date: 'Nehasse • August',
            type: 'cultural',
            description: 'Festival celebrated by women and girls in Tigray and Amhara with singing and dancing'
        },
        {
            name: 'Buhe',
            amharic: 'ቡሄ',
            date: 'Nehasse 19 • August 25',
            type: 'cultural',
            description: 'Traditional festival with boys singing door-to-door and receiving bread'
        },
        {
            name: 'Irreecha (Irreessa)',
            amharic: 'ኢሬቻ',
            date: 'Meskerem • October',
            type: 'religious',
            description: 'Oromo thanksgiving festival marking the end of the rainy season'
        },
        {
            name: 'Hudadi (Great Lent)',
            amharic: 'ሁዳዴ',
            date: '55 days before Fasika',
            type: 'religious',
            description: 'Longest Orthodox fast with abstinence from animal products and daily prayers'
        },
        {
            name: 'Kidus Yohannes (St. John’s Day)',
            amharic: 'ቅዱስ ዮሐንስ',
            date: 'Terr 4 • January 12',
            type: 'religious',
            description: 'Feast of St. John the Baptist with church services and community gatherings'
        },
        {
            name: 'Hosanna (Palm Sunday)',
            amharic: 'ሆሳንና',
            date: 'Variable • Week before Fasika',
            type: 'religious',
            description: 'Commemorates Jesus Christ’s triumphant entry into Jerusalem with palm processions'
        },
        {
            name: 'Kulubi Gabriel',
            amharic: 'ቁሉቢ ገብርኤል',
            date: 'Tahsas 12 & 19 • December 28 & January 4',
            type: 'religious',
            description: 'Massive pilgrimage to honor Archangel Gabriel with prayers and blessings'
        }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateDropdowns();
        this.renderMonthsGrid();
        this.renderHolidaysGrid();
        this.setupNavigation();
    }

    setupEventListeners() {
        // Dropdown change events
        document.getElementById('input-year').addEventListener('change', () => {
            this.onYearChange();
            this.convertIfComplete();
        });
        
        document.getElementById('input-month').addEventListener('change', () => {
            this.onMonthChange();
            this.convertIfComplete();
        });
        
        document.getElementById('input-day').addEventListener('change', () => {
            this.convertIfComplete();
        });

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });
        }
    }

    setupNavigation() {
        // Desktop navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showPage(item.dataset.page);
            });
        });

        // Mobile navigation
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showPage(item.dataset.page);
                document.querySelector('.mobile-nav').classList.remove('active');
            });
        });
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(pageName).classList.add('active');
        
        // Update navigation states
        document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
    }

    populateDropdowns() {
        this.populateYears();
        this.populateMonths();
        this.resetDays();
        this.updateInputGuides();
    }

    populateYears() {
        const yearSelect = document.getElementById('input-year');
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        
        const startYear = this.currentMode === 'eth-to-greg' ? 1900 : 1900;
        const endYear = this.currentMode === 'eth-to-greg' ? 2500 : 2500;
        
        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    populateMonths() {
        const monthSelect = document.getElementById('input-month');
        monthSelect.innerHTML = '<option value="">Select Month</option>';
        
        if (this.currentMode === 'eth-to-greg') {
            this.ethiopianMonths.forEach((month, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = `${index + 1}. ${month.latin} / ${month.amharic}`;
                monthSelect.appendChild(option);
            });
        } else {
            this.gregorianMonths.forEach((month, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = `${index + 1}. ${month}`;
                monthSelect.appendChild(option);
            });
        }
    }

    onYearChange() {
        const yearSelect = document.getElementById('input-year');
        const monthSelect = document.getElementById('input-month');
        
        if (yearSelect.value) {
            monthSelect.disabled = false;
            this.updateInputGuides('month');
        } else {
            monthSelect.disabled = true;
            this.resetDays();
        }
    }

    onMonthChange() {
        const yearSelect = document.getElementById('input-year');
        const monthSelect = document.getElementById('input-month');
        const daySelect = document.getElementById('input-day');
        
        if (yearSelect.value && monthSelect.value) {
            daySelect.disabled = false;
            this.updateDays();
            this.updateInputGuides('day');
        } else {
            daySelect.disabled = true;
        }
    }

    updateDays() {
        const yearSelect = document.getElementById('input-year');
        const monthSelect = document.getElementById('input-month');
        const daySelect = document.getElementById('input-day');
        
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);
        
        daySelect.innerHTML = '<option value="">Select Day</option>';
        
        if (!year || !month) return;
        
        let maxDays = 30;
        
        if (this.currentMode === 'eth-to-greg') {
            if (month === 13) {
                maxDays = ((year % 4) === 3) ? 6 : 5;
            } else {
                maxDays = 30;
            }
        } else {
            const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            maxDays = daysInMonth[month - 1];
            
            if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) {
                maxDays = 29;
            }
        }
        
        for (let day = 1; day <= maxDays; day++) {
            const option = document.createElement('option');
            option.value = day;
            if (this.currentMode === 'eth-to-greg' && day <= 30) {
                const amharicNum = this.amharicNumbers[day - 1] || day;
                option.textContent = `${day} / ${amharicNum}`;
            } else {
                option.textContent = day;
            }
            daySelect.appendChild(option);
        }
    }

    resetDays() {
        const daySelect = document.getElementById('input-day');
        daySelect.innerHTML = '<option value="">Select Day</option>';
        daySelect.disabled = true;
        this.updateInputGuides('year');
    }

    updateInputGuides(currentStep = 'year') {
        const yearGroup = document.querySelector('.year-group');
        const monthGroup = document.querySelector('.month-group');
        const dayGroup = document.querySelector('.day-group');
        
        // Remove all active states
        [yearGroup, monthGroup, dayGroup].forEach(group => {
            group.classList.remove('active');
        });
        
        // Add active state to current step
        if (currentStep === 'year') {
            yearGroup.classList.add('active');
        } else if (currentStep === 'month') {
            monthGroup.classList.add('active');
        } else if (currentStep === 'day') {
            dayGroup.classList.add('active');
        }
    }

    convertIfComplete() {
        const year = parseInt(document.getElementById('input-year').value);
        const month = parseInt(document.getElementById('input-month').value);
        const day = parseInt(document.getElementById('input-day').value);
        
        if (year && month && day && !this.isConverting) {
            this.isConverting = true;
            
            // Add a small delay for smooth UX
            setTimeout(() => {
                this.convertDate();
                this.isConverting = false;
            }, 300);
        } else if (!year || !month || !day) {
            this.hideResult();
        }
    }

    convertDate() {
        const year = parseInt(document.getElementById('input-year').value);
        const month = parseInt(document.getElementById('input-month').value);
        const day = parseInt(document.getElementById('input-day').value);
        
        if (!year || !month || !day) {
            return;
        }
        
        try {
            if (this.currentMode === 'eth-to-greg') {
                const gregorianDate = EthiopianDateConverter.toGregorian(year, month, day);
                this.displayGregorianResult(gregorianDate, { year, month, day });
            } else {
                const ethiopianDate = EthiopianDateConverter.toEthiopian(year, month, day);
                this.displayEthiopianResult(ethiopianDate, new Date(year, month - 1, day));
            }
            
            this.showResult();
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Invalid date or conversion error');
        }
    }

    displayGregorianResult(date, ethDate) {
        const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
        const weekdayIndex = date.getDay();
        
        document.getElementById('result-year').textContent = date.getFullYear();
        document.getElementById('result-year-amharic').textContent = '';
        
        document.getElementById('result-month').textContent = this.gregorianMonths[date.getMonth()];
        document.getElementById('result-month-amharic').textContent = '';
        
        document.getElementById('result-day').textContent = date.getDate();
        document.getElementById('result-day-amharic').textContent = '';
        
        document.getElementById('result-weekday').textContent = weekday;
        document.getElementById('result-weekday-amharic').textContent = this.ethiopianWeekdays[weekdayIndex].amharic;
        
        // Full date display
        const fullDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('full-date-display').textContent = fullDate;
    }

    displayEthiopianResult(ethDate, gregDate) {
        const weekdayIndex = gregDate.getDay();
        
        document.getElementById('result-year').textContent = ethDate.year;
        document.getElementById('result-year-amharic').textContent = this.getAmharicYear(ethDate.year);
        
        document.getElementById('result-month').textContent = this.ethiopianMonths[ethDate.month - 1].latin;
        document.getElementById('result-month-amharic').textContent = this.ethiopianMonths[ethDate.month - 1].amharic;
        
        document.getElementById('result-day').textContent = ethDate.day;
        document.getElementById('result-day-amharic').textContent = this.amharicNumbers[ethDate.day - 1] || ethDate.day;
        
        document.getElementById('result-weekday').textContent = this.ethiopianWeekdays[weekdayIndex].latin;
        document.getElementById('result-weekday-amharic').textContent = this.ethiopianWeekdays[weekdayIndex].amharic;
        
        // Full date display in Ethiopian format
        const fullDate = `${this.ethiopianWeekdays[weekdayIndex].amharic}፣ ${this.ethiopianMonths[ethDate.month - 1].amharic} ${(ethDate.day)} (${this.amharicNumbers[ethDate.day - 1] || ethDate.day}) ፣ ${ethDate.year} (${this.getAmharicYear(ethDate.year)})`;
        document.getElementById('full-date-display').textContent = fullDate;
    }

    getAmharicYear(year) {
        // Convert year to Amharic representation
        const thousands = Math.floor(year / 1000);
        const remainder = year % 1000;
        
        if (thousands === 2) {
            return `፪ሺ${this.getAmharicNumber(remainder)}`;
        }
        return year.toString();
    }

    getAmharicNumber(num) {
        if (num === 0) return '';
        if (num <= 30) return this.amharicNumbers[num - 1];
        
        // For numbers > 30, create composite representation
        const tens = Math.floor(num / 10) * 10;
        const ones = num % 10;
        
        // This is a simplified version - a complete implementation would need more Amharic number rules
        return `${tens}${ones ? this.amharicNumbers[ones - 1] : ''}`;
    }

    showResult() {
        document.getElementById('result-placeholder').style.display = 'none';
        document.getElementById('result-display').style.display = 'block';
    }

    hideResult() {
        document.getElementById('result-placeholder').style.display = 'flex';
        document.getElementById('result-display').style.display = 'none';
    }

    showError(message) {
        // Could implement a toast notification system here
        console.error(message);
    }

    renderMonthsGrid() {
        const monthsGrid = document.getElementById('months-grid');
        if (!monthsGrid) return;
        
        monthsGrid.innerHTML = '';
        
        this.ethiopianMonths.forEach((month, index) => {
            const monthCard = document.createElement('div');
            monthCard.className = 'month-card';
            
            monthCard.innerHTML = `
                <div class="month-number">${index + 1}</div>
                <div class="month-name-amharic">${month.amharic}</div>
                <div class="month-name-latin">${month.latin}</div>
                <div class="month-greg-equiv">${month.gregEquiv}</div>
            `;
            
            monthsGrid.appendChild(monthCard);
        });
    }

    renderHolidaysGrid() {
        const holidaysGrid = document.getElementById('holidays-grid');
        if (!holidaysGrid) return;
        
        holidaysGrid.innerHTML = '';
        
        this.holidays.forEach(holiday => {
            const holidayCard = document.createElement('div');
            holidayCard.className = 'holiday-card';
            
            holidayCard.innerHTML = `
                <div class="holiday-type ${holiday.type}">${holiday.type}</div>
                <h3>${holiday.name}</h3>
                <div class="holiday-amharic">${holiday.amharic}</div>
                <div class="holiday-date">${holiday.date}</div>
                <p>${holiday.description}</p>
            `;
            
            holidaysGrid.appendChild(holidayCard);
        });
    }

    // Quick action methods
    setToday() {
        const today = new Date();
        
        if (this.currentMode === 'greg-to-eth') {
            document.getElementById('input-year').value = today.getFullYear();
            document.getElementById('input-month').value = today.getMonth() + 1;
            this.onYearChange();
            this.onMonthChange();
            document.getElementById('input-day').value = today.getDate();
        } else {
            // Convert today to Ethiopian date first
            try {
                const ethDate = EthiopianDateConverter.toEthiopian(
                    today.getFullYear(), 
                    today.getMonth() + 1, 
                    today.getDate()
                );
                
                document.getElementById('input-year').value = ethDate.year;
                document.getElementById('input-month').value = ethDate.month;
                this.onYearChange();
                this.onMonthChange();
                document.getElementById('input-day').value = ethDate.day;
            } catch (error) {
                console.error('Error setting today\'s Ethiopian date:', error);
            }
        }
        
        this.convertIfComplete();
    }

    setNewYear() {
        if (this.currentMode === 'eth-to-greg') {
            document.getElementById('input-year').value = '2018'; // Current Ethiopian year
            document.getElementById('input-month').value = '1'; // Meskerem
            this.onYearChange();
            this.onMonthChange();
            document.getElementById('input-day').value = '1';
        } else {
            document.getElementById('input-year').value = '2025';
            document.getElementById('input-month').value = '1'; // Janauary
            this.onYearChange();
            this.onMonthChange();
            document.getElementById('input-day').value = '1';
        }
        
        this.convertIfComplete();
    }

    clearDate() {
        document.getElementById('input-year').value = '';
        document.getElementById('input-month').value = '';
        document.getElementById('input-day').value = '';
        
        document.getElementById('input-month').disabled = true;
        document.getElementById('input-day').disabled = true;
        
        this.hideResult();
        this.updateInputGuides('year');
    }
}

// Mode switching functionality
window.switchMode = function() {
    const app = window.calendarApp;
    const switchToggle = document.querySelector('.switch-toggle');
    const leftLabel = document.querySelector('.switch-label.left');
    const rightLabel = document.querySelector('.switch-label.right');
    
    // Toggle mode
    app.currentMode = app.currentMode === 'eth-to-greg' ? 'greg-to-eth' : 'eth-to-greg';
    
    // Update UI
    switchToggle.classList.toggle('active');
    leftLabel.classList.toggle('active');
    rightLabel.classList.toggle('active');
    
    // Update titles
    document.getElementById('input-title').textContent = 
        app.currentMode === 'eth-to-greg' ? 'Ethiopian Date' : 'Gregorian Date';
    document.getElementById('output-title').textContent = 
        app.currentMode === 'eth-to-greg' ? 'Gregorian Date' : 'Ethiopian Date';
    
    // Clear and repopulate
    app.clearDate();
    app.populateDropdowns();
};

// Quick action functions
window.setToday = function() {
    window.calendarApp.setToday();
};

window.setNewYear = function() {
    window.calendarApp.setNewYear();
};

window.clearDate = function() {
    window.calendarApp.clearDate();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.calendarApp = new CalendarApp();
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Refresh any dynamic content when page becomes visible
        if (window.calendarApp) {
            // Could add refresh logic here if needed
        }
    }
});

const ethiopianCalendarData = {
    months: [
        { 
            number: 1, 
            amharic: "መስከረም", 
            latin: "Mäskäräm", 
            days: 30, 
            gregorianStart: "Sept 11", 
            gregorianEnd: "Oct 10",
            season: "Spring",
            description: "First month marking New Year and end of rainy season"
        },
        { 
            number: 2, 
            amharic: "ጥቅምት", 
            latin: "Ṭəqəmt", 
            days: 30, 
            gregorianStart: "Oct 11", 
            gregorianEnd: "Nov 9",
            season: "Spring",
            description: "Harvest season begins"
        },
        { 
            number: 3, 
            amharic: "ኅዳር", 
            latin: "Ḫədar", 
            days: 30, 
            gregorianStart: "Nov 10", 
            gregorianEnd: "Dec 9",
            season: "Spring",
            description: "Dry season continues"
        },
        { 
            number: 4, 
            amharic: "ታኅሣሥ", 
            latin: "Taḫśaś", 
            days: 30, 
            gregorianStart: "Dec 10", 
            gregorianEnd: "Jan 8",
            season: "Summer",
            description: "Contains Ethiopian Christmas (Genna)"
        },
        { 
            number: 5, 
            amharic: "ጥር", 
            latin: "Ṭərr", 
            days: 30, 
            gregorianStart: "Jan 9", 
            gregorianEnd: "Feb 7",
            season: "Summer",
            description: "Contains Timkat (Epiphany) celebration"
        },
        { 
            number: 6, 
            amharic: "የካቲት", 
            latin: "Yäkatit", 
            days: 30, 
            gregorianStart: "Feb 8", 
            gregorianEnd: "Mar 9",
            season: "Summer",
            description: "Dry season peak"
        },
        { 
            number: 7, 
            amharic: "መጋቢት", 
            latin: "Mägabit", 
            days: 30, 
            gregorianStart: "Mar 10", 
            gregorianEnd: "Apr 8",
            season: "Summer",
            description: "Pre-rainy season preparation"
        },
        { 
            number: 8, 
            amharic: "ሚያዝያ", 
            latin: "Miyazya", 
            days: 30, 
            gregorianStart: "Apr 9", 
            gregorianEnd: "May 8",
            season: "Summer",
            description: "Often contains Easter celebrations"
        },
        { 
            number: 9, 
            amharic: "ግንቦት", 
            latin: "Gənbot", 
            days: 30, 
            gregorianStart: "May 9", 
            gregorianEnd: "Jun 7",
            season: "Summer",
            description: "Small rains may begin"
        },
        { 
            number: 10, 
            amharic: "ሰኔ", 
            latin: "Säne", 
            days: 30, 
            gregorianStart: "Jun 8", 
            gregorianEnd: "Jul 7",
            season: "Rainy Season",
            description: "Rainy season begins"
        },
        { 
            number: 11, 
            amharic: "ሐምሌ", 
            latin: "Ḥamle", 
            days: 30, 
            gregorianStart: "Jul 8", 
            gregorianEnd: "Aug 6",
            season: "Rainy Season",
            description: "Peak of rainy season"
        },
        { 
            number: 12, 
            amharic: "ነሐሴ", 
            latin: "Näḥase", 
            days: 30, 
            gregorianStart: "Aug 7", 
            gregorianEnd: "Sept 5",
            season: "Rainy Season",
            description: "End of rainy season"
        },
        { 
            number: 13, 
            amharic: "ጳጉሜ", 
            latin: "Ṗagume", 
            days: "5-6", 
            gregorianStart: "Sept 6", 
            gregorianEnd: "Sept 10/11",
            season: "Transition",
            description: "Short month, 6 days in leap years"
        }
    ]
};

// Populate months grid
function populateMonthsGrid() {
    const monthsGrid = document.getElementById('months-grid');
    if (!monthsGrid) return;
    
    monthsGrid.innerHTML = '';
    
    ethiopianCalendarData.months.forEach(month => {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        monthCard.innerHTML = `
            <div class="month-number">${month.number}</div>
            <div class="month-name-amharic">${month.amharic}</div>
            <div class="month-name-latin">${month.latin}</div>
            <div class="month-greg-equiv">${month.gregorianStart} - ${month.gregorianEnd}</div>
            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
                ${month.days} days • ${month.season}
            </div>
        `;
        monthsGrid.appendChild(monthCard);
    });
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    populateMonthsGrid();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});





// Floating Message Box Functionality
let messageBoxOpen = false;
let currentTab = 'messages';
let messageCount = 2;

// Toggle Message Box
function toggleMessageBox() {
    const messageBox = document.getElementById('message-box');
    const toggleIcon = document.getElementById('toggle-icon');
    
    messageBoxOpen = !messageBoxOpen;
    
    if (messageBoxOpen) {
        messageBox.classList.add('active');
        toggleIcon.textContent = '✕';
        updateNotificationBadge();
    } else {
        messageBox.classList.remove('active');
        toggleIcon.textContent = '💬';
    }
}

// Close Message Box
function closeMessageBox() {
    const messageBox = document.getElementById('message-box');
    const toggleIcon = document.getElementById('toggle-icon');
    
    messageBox.classList.remove('active');
    toggleIcon.textContent = '💬';
    messageBoxOpen = false;
}

// Switch Tabs
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
    
    currentTab = tabName;
}





// Character Count for Textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('feedback-message');
    const charCount = document.getElementById('char-count');
    
    if (textarea) {
        textarea.addEventListener('input', updateCharCount);
    }
    
    function updateCharCount() {
        const count = textarea.value.length;
        charCount.textContent = count;
        
        if (count > 450) {
            charCount.style.color = '#dc2626';
        } else if (count > 400) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#6b7280';
        }
    }
});

// Add System Message (for dynamic messages)
function addSystemMessage(type, title, text, time) {
    const systemMessages = document.querySelector('.system-messages');
    const noMessages = document.getElementById('no-messages');
    
    const messageHtml = `
        <div class="message-item ${type}-message">
            <div class="message-icon">${getMessageIcon(type)}</div>
            <div class="message-content">
                <div class="message-title">${title}</div>
                <div class="message-text">${text}</div>
                <div class="message-time">${time}</div>
            </div>
            <button class="message-close" onclick="removeMessage(this)">×</button>
        </div>
    `;
    
    systemMessages.insertAdjacentHTML('afterbegin', messageHtml);
    messageCount++;
    updateNotificationBadge();
    noMessages.style.display = 'none';
}

// Get Message Icon
function getMessageIcon(type) {
    const icons = {
        'system': '🎉',
        'tip': '💡',
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    return icons[type] || 'ℹ️';
}

// Close message box when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.floating-message-container');
    const messageBox = document.getElementById('message-box');
    
    if (messageBoxOpen && !container.contains(event.target)) {
        closeMessageBox();
    }
});

// Add slide out animation
const slideOutKeyframes = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Add the animation to stylesheet
const style = document.createElement('style');
style.textContent = slideOutKeyframes;
document.head.appendChild(style);
