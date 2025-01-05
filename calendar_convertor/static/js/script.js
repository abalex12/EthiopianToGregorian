document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sideNav = document.querySelector('.side-nav');
    const mainContent = document.querySelector('.main-content');

    menuBtn.addEventListener('click', () => {
        sideNav.classList.toggle('active');
        mainContent.classList.toggle('nav-open');
    });

    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Populate Ethiopian month options
    const ethiopianMonths = [
        ' Choose a Month(ወራት)',
        'Meskerem (መስከረም)', 'Tikimt (ጥቅምት)', 'Hidar (ኅዳር)', 'Tahsas (ታኅሣሥ)',
        'Tir (ጥር)', 'Yekatit (የካቲት)', 'Megabit (መጋቢት)', 'Miazia (ሚያዝያ)',
        'Genbot (ግንቦት)', 'Sene (ሰኔ)', 'Hamle (ሃምሌ)', 'Nehase (ነሐሴ)', 'Pagume (ጳጉሜ)'
    ];

    const ethiopianMonthSelect = document.getElementById('ethiopian-month');
    
    ethiopianMonths.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        ethiopianMonthSelect.appendChild(option);
    });

    // Populate Ethiopian year options dynamically
    const ethiopianYearInput = document.getElementById('ethiopian-year');
    const currentYear = new Date().getFullYear();
    const ethiopianYearDiff = 7; // Ethiopian calendar is approximately 7-8 years behind

    // Create year select element
    const yearSelect = document.createElement('select');
    yearSelect.className = 'styled-select';
    yearSelect.id = 'ethiopian-year';

    // Add a placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Choose Year (ዓመት)';
    yearSelect.appendChild(placeholderOption);

    // Generate 100 years before and after current Ethiopian year
    const currentEthiopianYear = currentYear - ethiopianYearDiff;
    for (let year = currentEthiopianYear - 100; year <= currentEthiopianYear + 100; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Replace the input with select
    ethiopianYearInput.parentNode.replaceChild(yearSelect, ethiopianYearInput);

    // Update Ethiopian days based on selected month
    function updateEthiopianDays() {
        const ethiopianDaySelect = document.getElementById('ethiopian-day');
        const selectedMonth = ethiopianMonthSelect.value;
        
        ethiopianDaySelect.innerHTML = '<option value="">Choose Day (ቀን)</option>';
        
        if (selectedMonth > 0) { // Only add days if a valid month is selected
            const maxDays = selectedMonth == 13 ? 6 : 30;
            for (let i = 1; i <= maxDays; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                ethiopianDaySelect.appendChild(option);
            }
        }
    }

    ethiopianMonthSelect.addEventListener('change', updateEthiopianDays);
    updateEthiopianDays(); // Initial population

    function formatEthiopianDate(responseText) {
        const ethiopianMonths = {
            1: 'መስከረም',
            2: 'ጥቅምት',
            3: 'ኅዳር',
            4: 'ታኅሣሥ',
            5: 'ጥር',
            6: 'የካቲት',
            7: 'መጋቢት',
            8: 'ሚያዝያ',
            9: 'ግንቦት',
            10: 'ሰኔ',
            11: 'ሃምሌ',
            12: 'ነሐሴ',
            13: 'ጳጉሜ'
        };        
        // Array for day names
        const dayNames = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];
    
        try {
            const data = JSON.parse(responseText);
            if (data.success && data.result) {
                const { day, month, year } = data.result;
                

                
                // Format numeric date
                const numericDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                
                // Format written date
                const writtenDate = `${ethiopianMonths[month]} ${day}, ${year}`;
                
                // Return both formats
                return {
                    numeric: numericDate,
                    written: writtenDate
                };
            }
            return {
                numeric: 'Invalid date',
                written: 'Invalid date'
            };
        } catch (error) {
            console.error('Error parsing date:', error);
            return {
                numeric: 'Invalid date',
                written: 'Invalid date'
            };
        }
    }

    function formatGregorianDate(responseText) {
        // Array for month names in English
        const gregorianMonths = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];    
        // Array for day names in English
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
        try {
            const data = JSON.parse(responseText);
            if (data.success && data.result) {
                const { day, month, year } = data.result;
    
                // Format numeric date
                const numericDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
                // Format written date
                const writtenDate = `${gregorianMonths[month - 1]} ${day}, ${year}`;
    
                // Return both formats
                return {
                    numeric: numericDate,
                    written: writtenDate
                };
            }
            return {
                numeric: 'Invalid date',
                written: 'Invalid date'
            };
        } catch (error) {
            console.error('Error parsing date:', error);
            return {
                numeric: 'Invalid date',
                written: 'Invalid date'
            };
        }
    }
    
    function validateEthiopianInputs() {
        const year = yearSelect.value;
        const month = ethiopianMonthSelect.value;
        const day = document.getElementById('ethiopian-day').value;
        
        return year && month > 0 && day; // Ensure month is not the placeholder (index 0)
    }

    function convertEthiopianToGregorian() {
        if (validateEthiopianInputs()) {
            const year = yearSelect.value;
            const month = ethiopianMonthSelect.value;
            const day = document.getElementById('ethiopian-day').value;

            fetch(`/convert?conversionType=ethiopianToGregorian&ethiopianYear=${year}&ethiopianMonth=${month}&ethiopianDay=${day}`)
                .then(response => response.text())
                .then(data => {
                    const resultContainer = document.getElementById('gregorian-result');
                    const formattedDate = formatGregorianDate(data);
                    resultContainer.querySelector('.result-value').textContent = `${formattedDate.numeric} or  ${formattedDate.written}`;
                    resultContainer.classList.add('slide-in');
                })
                .catch(error => console.error('Error:', error));
        }
    }

    function convertGregorianToEthiopian() {
        const gregorianDate = document.getElementById('gregorian-date').value;

        if (gregorianDate) {
            fetch(`/convert?conversionType=gregorianToEthiopian&gregorianDate=${gregorianDate}`)
                .then(response => response.text())
                .then(data => {
                    const resultContainer = document.getElementById('ethiopian-result');
                    const formattedDate = formatEthiopianDate(data);
                    resultContainer.querySelector('.result-value').textContent = 
                    ` ${formattedDate.written}`;

                    resultContainer.classList.add('slide-in');
                })
                .catch(error => console.error('Error:', error));
        }
    }

    // Event listeners for auto-conversion
    const ethiopianInputs = [
        yearSelect,
        ethiopianMonthSelect,
        document.getElementById('ethiopian-day')
    ];

    ethiopianInputs.forEach(input => {
        input.addEventListener('change', convertEthiopianToGregorian);
    });

    document.getElementById('gregorian-date').addEventListener('change', convertGregorianToEthiopian);

    // Quick Facts Carousel
    const facts = [
        "The Ethiopian calendar is 7-8 years behind the Gregorian calendar",
        "Ethiopian calendar has 13 months",
        "The Ethiopian New Year begins in September",
        "Each month has 30 days except the last month"
    ];

    let currentFactIndex = 0;
    const factsCarousel = document.querySelector('.facts-carousel');
    const prevFactBtn = document.querySelector('.prev-fact');
    const nextFactBtn = document.querySelector('.next-fact');

    function updateFact() {
        factsCarousel.innerHTML = `<p class="slide-in">${facts[currentFactIndex]}</p>`;
    }

    prevFactBtn.addEventListener('click', () => {
        currentFactIndex = (currentFactIndex - 1 + facts.length) % facts.length;
        updateFact();
    });

    nextFactBtn.addEventListener('click', () => {
        currentFactIndex = (currentFactIndex + 1) % facts.length;
        updateFact();
    });

    updateFact();

    // Update Today's Date
    function updateTodayDates() {
        const today = new Date();
        document.getElementById('today-gregorian').textContent = today.toLocaleDateString();
        
        fetch(`/convert?conversionType=gregorianToEthiopian&gregorianDate=${today.toISOString().split('T')[0]}`)
            .then(response => response.text())
            .then(data => {
                const formattedDate = formatEthiopianDate(data);
                document.getElementById('today-ethiopian').textContent = `${formattedDate.written}`;
            })
            .catch(error => console.error('Error:', error));
    }

    updateTodayDates();
    setInterval(updateTodayDates, 60000);

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (sideNav.classList.contains('active') && 
            !sideNav.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            sideNav.classList.remove('active');
            mainContent.classList.remove('nav-open');
        }
    });
});