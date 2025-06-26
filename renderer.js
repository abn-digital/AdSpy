let selectedPlatform = null;
let zipBuffer = null;
let captureProgressInterval; // To store the interval for progress animation

// Get DOM elements
const platformOptions = document.querySelectorAll('.platform-option');
const regionSelectHidden = document.getElementById('region'); // Hidden input to store value
const regionSelectTrigger = document.getElementById('region-select-trigger');
const customRegionOptionsContainer = document.getElementById('custom-region-options');
const selectedRegionText = document.getElementById('selected-region-text');
const regionSearchInput = document.getElementById('region-search-input'); // New search input

const advertiserInput = document.getElementById('advertiserUrl');
const maxScreenshotsInput = document.getElementById('maxScreenshots');
const captureBtn = document.getElementById('captureBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');
const buttonText = document.getElementById('buttonText');
const progressBar = document.getElementById('progressBar');
const progressBarFill = document.getElementById('progressBarFill');

// Define all countries (ISO 3166-1 alpha-2 codes and names)
const allCountries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'RO', name: 'Romania' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'KR', name: 'South Korea' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'PH', name: 'Philippines' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'TR', name: 'Turkey' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'IL', name: 'Israel' },
    { code: 'EG', name: 'Egypt' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AX', name: 'Åland Islands' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia (Plurinational State of)' },
    { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BV', name: 'Bouvet Island' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'BN', name: 'Brunei Darussalam' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CC', name: 'Cocos (Keeling) Islands' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'Congo, Democratic Republic of the' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CW', name: 'Curaçao' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FK', name: 'Falkland Islands (Malvinas)' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'TF', name: 'French Southern Territories' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GU', name: 'Guam' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GG', name: 'Guernsey' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HM', name: 'Heard Island and McDonald Islands' },
    { code: 'VA', name: 'Holy See' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IR', name: 'Iran (Islamic Republic of)' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'Korea (Democratic People\'s Republic of)' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Lao People\'s Democratic Republic' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MO', name: 'Macao' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'FM', name: 'Micronesia (Federated States of)' },
    { code: 'MD', name: 'Moldova, Republic of' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NU', name: 'Niue' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' },
    { code: 'PS', name: 'Palestine, State of' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PN', name: 'Pitcairn' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RE', name: 'Réunion' },
    { code: 'RU', name: 'Russian Federation' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'BL', name: 'Saint Barthélemy' },
    { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'MF', name: 'Saint Martin (French part)' },
    { code: 'PM', name: 'Saint Pierre and Miquelon' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SX', name: 'Sint Maarten (Dutch part)' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SY', name: 'Syrian Arab Republic' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania, United Republic of' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VU', name: 'Vanuatu' },
];

const FAVORITE_COUNTRIES_KEY = 'favoriteCountries';
const LAST_SELECTED_REGION_KEY = 'lastSelectedRegion';

// Camera animation properties
const cameraEmoji = '📸';
const animationLength = 5; // Number of cameras to display in sequence
let currentAnimationFrame = 0; // Tracks which camera is currently displayed
let baseStatusMessage = ''; // Stores the status message without the animation

// --- Helper Functions ---

const updateCaptureButton_ = () => {
    const isValid = selectedPlatform && regionSelectHidden.value && advertiserInput.value.trim();
    console.log('Button validation:', {
        selectedPlatform,
        region: regionSelectHidden.value,
        advertiser: advertiserInput.value.trim(),
        isValid
    });
    captureBtn.disabled = !isValid;
    
    if (!selectedPlatform) {
        buttonText.textContent = 'Select a Platform';
    } else if (!regionSelectHidden.value) {
        buttonText.textContent = 'Select a Region';
    } else if (!advertiserInput.value.trim()) {
        buttonText.textContent = 'Enter Advertiser Info';
    } else {
        buttonText.textContent = 'Capture Screenshots';
    }
};

const validateMaxScreenshots_ = () => {
    const value = parseInt(maxScreenshotsInput.value);
    if (isNaN(value) || value < 1) {
        maxScreenshotsInput.value = '1';
    } else if (value > 100) {
        maxScreenshotsInput.value = '100';
    }
};

const validateForm_ = () => {
    if (!selectedPlatform) {
        showStatus_('error', 'Please select a platform');
        return false;
    }
    
    if (!regionSelectHidden.value) {
        showStatus_('error', 'Please select a region');
        return false;
    }
    
    if (!advertiserInput.value.trim()) {
        showStatus_('error', 'Please enter an advertiser URL or name');
        return false;
    }
    
    const maxScreenshots = parseInt(maxScreenshotsInput.value);
    if (isNaN(maxScreenshots) || maxScreenshots < 1 || maxScreenshots > 100) {
        showStatus_('error', 'Please enter a valid number of screenshots (1-100)');
        return false;
    }
    
    return true;
};

const setFormEnabled_ = (enabled) => {
    platformOptions.forEach(option => {
        option.style.pointerEvents = enabled ? 'auto' : 'none';
        option.style.opacity = enabled ? '1' : '0.6';
    });
    regionSelectTrigger.style.pointerEvents = enabled ? 'auto' : 'none';
    regionSelectTrigger.style.opacity = enabled ? '1' : '0.6';
    advertiserInput.disabled = !enabled;
    maxScreenshotsInput.disabled = !enabled;
    captureBtn.disabled = !enabled;
    
    if (!enabled) {
        buttonText.innerHTML = '<span class="spinner"></span>Capturing...';
    } else {
        updateCaptureButton_();
    }
};

const showStatus_ = (type, message) => {
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    baseStatusMessage = message; // Store the message without animation for later use
};

const showProgress_ = (show) => {
    progressBar.style.display = show ? 'block' : 'none';
    if (!show) {
        progressBarFill.style.width = '0%';
        clearInterval(captureProgressInterval); // Clear the generic progress interval
    } else {
        // Simulate progress (existing behavior)
        let progress = 0;
        clearInterval(captureProgressInterval); // Ensure previous interval is cleared
        captureProgressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                clearInterval(captureProgressInterval);
                progress = 90;
            }
            updateProgress_(progress);
        }, 500);
    }
};

const updateProgress_ = (percent) => {
    progressBarFill.style.width = `${percent}%`;
};

// Function to get favorite countries from localStorage
const getFavoriteCountries = () => {
    const favorites = localStorage.getItem(FAVORITE_COUNTRIES_KEY);
    return favorites ? JSON.parse(favorites) : [];
};

// Function to save favorite countries to localStorage
const saveFavoriteCountries = (favorites) => {
    localStorage.setItem(FAVORITE_COUNTRIES_KEY, JSON.stringify(favorites));
};

// Function to toggle favorite status
const toggleFavoriteCountry = (countryCode) => {
    let favorites = getFavoriteCountries();
    if (favorites.includes(countryCode)) {
        favorites = favorites.filter(code => code !== countryCode);
    } else {
        favorites.push(countryCode);
    }
    saveFavoriteCountries(favorites);
    populateCustomRegionSelect(); // Re-populate to show updated favorites
    // Re-apply filter if search input is active
    filterCountries(regionSearchInput.value.toLowerCase());
};

// Function to populate the custom region dropdown
const populateCustomRegionSelect = (filterText = '') => {
    const favorites = getFavoriteCountries();
    customRegionOptionsContainer.innerHTML = ''; // Clear existing options

    const lowerCaseFilter = filterText.toLowerCase();

    // Filter countries based on search text
    const filteredCountries = allCountries.filter(country => 
        country.name.toLowerCase().includes(lowerCaseFilter)
    );

    // Separate and sort filtered countries
    const favoriteCountries = filteredCountries.filter(country => favorites.includes(country.code))
                                         .sort((a, b) => a.name.localeCompare(b.name));
    const otherCountries = filteredCountries.filter(country => !favorites.includes(country.code))
                                      .sort((a, b) => a.name.localeCompare(b.name));

    if (favoriteCountries.length > 0) {
        const favoriteGroupLabel = document.createElement('div');
        favoriteGroupLabel.classList.add('custom-option-group-label');
        favoriteGroupLabel.textContent = '★ Favorites';
        customRegionOptionsContainer.appendChild(favoriteGroupLabel);

        favoriteCountries.forEach(country => {
            appendCustomOption(country, true);
        });
    }

    const allCountriesGroupLabel = document.createElement('div');
    allCountriesGroupLabel.classList.add('custom-option-group-label');
    allCountriesGroupLabel.textContent = 'All Countries';
    customRegionOptionsContainer.appendChild(allCountriesGroupLabel);

    otherCountries.forEach(country => {
        appendCustomOption(country, false);
    });

    // If no filtered results, show a message
    if (filteredCountries.length === 0 && filterText.length > 0) {
        const noResults = document.createElement('div');
        noResults.classList.add('custom-option');
        noResults.textContent = 'No matching countries found.';
        noResults.style.cursor = 'default';
        noResults.style.justifyContent = 'center';
        noResults.style.color = '#777';
        customRegionOptionsContainer.appendChild(noResults);
    }

    // Set the selected text based on the hidden input's value
    const lastSelectedRegion = regionSelectHidden.value || localStorage.getItem(LAST_SELECTED_REGION_KEY);
    if (lastSelectedRegion) {
        const selectedCountry = allCountries.find(c => c.code === lastSelectedRegion);
        if (selectedCountry) {
            selectedRegionText.textContent = selectedCountry.name;
            regionSelectHidden.value = selectedCountry.code;
            // Highlight the selected option in the dropdown
            const currentSelectedOption = customRegionOptionsContainer.querySelector(`.custom-option[data-value="${lastSelectedRegion}"]`);
            if (currentSelectedOption) {
                currentSelectedOption.classList.add('selected');
            }
        }
    } else {
        selectedRegionText.textContent = 'Select a region...';
        regionSelectHidden.value = '';
    }
};

// Helper to append a single custom option
const appendCustomOption = (country, isFavorite) => {
    const optionDiv = document.createElement('div');
    optionDiv.classList.add('custom-option');
    if (isFavorite) {
        optionDiv.classList.add('is-favorite');
    }
    optionDiv.setAttribute('data-value', country.code);
    optionDiv.setAttribute('data-name', country.name);

    const countryNameSpan = document.createElement('span');
    countryNameSpan.textContent = country.name;
    optionDiv.appendChild(countryNameSpan);

    const favoriteStar = document.createElement('span');
    favoriteStar.classList.add('favorite-star');
    favoriteStar.textContent = isFavorite ? '★' : '☆'; // Filled or empty star
    favoriteStar.setAttribute('title', isFavorite ? 'Unfavorite' : 'Favorite');
    favoriteStar.classList.toggle('active', isFavorite); // Apply active class for styling

    favoriteStar.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent dropdown from closing or option from being selected
        toggleFavoriteCountry(country.code);
    });

    optionDiv.appendChild(favoriteStar);
    customRegionOptionsContainer.appendChild(optionDiv);
};

// Function to filter countries based on search input
const filterCountries = (searchText) => {
    populateCustomRegionSelect(searchText);
    // Scroll to top of options when filtering
    customRegionOptionsContainer.scrollTop = 0;
};

// --- Event Listeners ---

// Platform selection handlers
platformOptions.forEach(option => {
    option.addEventListener('click', () => {
        platformOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedPlatform = option.dataset.platform;
        console.log('Platform selected:', selectedPlatform);
        updateCaptureButton_();
    });
});

// Custom dropdown trigger
regionSelectTrigger.addEventListener('click', () => {
    const isOpen = customRegionOptionsContainer.classList.contains('open');
    if (!isOpen) {
        // Open dropdown
        customRegionOptionsContainer.classList.add('open');
        regionSelectTrigger.classList.add('active');
        selectedRegionText.style.display = 'none'; // Hide selected text
        regionSearchInput.style.display = 'block'; // Show search input
        regionSearchInput.value = ''; // Clear search input
        populateCustomRegionSelect(); // Re-populate with all options initially
        regionSearchInput.focus(); // Focus the search input
    } else {
        // Close dropdown
        customRegionOptionsContainer.classList.remove('open');
        regionSelectTrigger.classList.remove('active');
        regionSearchInput.style.display = 'none'; // Hide search input
        selectedRegionText.style.display = 'block'; // Show selected text
        // Ensure selected text is correct after closing
        const selectedCountry = allCountries.find(c => c.code === regionSelectHidden.value);
        selectedRegionText.textContent = selectedCountry ? selectedCountry.name : 'Select a region...';
    }
});

// Handle search input
regionSearchInput.addEventListener('input', (e) => {
    filterCountries(e.target.value);
});

// Select option in custom dropdown
customRegionOptionsContainer.addEventListener('click', (e) => {
    const targetOption = e.target.closest('.custom-option');
    if (targetOption) {
        // Prevent action if clicking the star
        if (e.target.classList.contains('favorite-star')) {
            return;
        }

        // Remove 'selected' class from previously selected option
        const currentSelected = customRegionOptionsContainer.querySelector('.custom-option.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        // Add 'selected' class to the clicked option
        targetOption.classList.add('selected');

        const selectedValue = targetOption.getAttribute('data-value');
        const selectedName = targetOption.getAttribute('data-name');
        
        selectedRegionText.textContent = selectedName;
        regionSelectHidden.value = selectedValue; // Update hidden input
        localStorage.setItem(LAST_SELECTED_REGION_KEY, selectedValue); // Persist selection

        customRegionOptionsContainer.classList.remove('open'); // Close dropdown
        regionSelectTrigger.classList.remove('active');
        regionSearchInput.style.display = 'none'; // Hide search input
        selectedRegionText.style.display = 'block'; // Show selected text
        updateCaptureButton_(); // Update button state
    }
});

// Close custom dropdown if clicked outside
document.addEventListener('click', (e) => {
    // Check if the click occurred outside the custom select wrapper
    const customSelectWrapper = regionSelectTrigger.closest('.custom-select-wrapper');
    if (customSelectWrapper && !customSelectWrapper.contains(e.target)) {
        if (customRegionOptionsContainer.classList.contains('open')) {
            customRegionOptionsContainer.classList.remove('open');
            regionSelectTrigger.classList.remove('active');
            regionSearchInput.style.display = 'none'; // Hide search input
            selectedRegionText.style.display = 'block'; // Show selected text
            // If the search input had focus, it will lose it, so we need to ensure
            // the trigger gets focus back if that's desired behavior.
        }
    }
});

advertiserInput.addEventListener('input', () => {
    console.log('Advertiser input:', advertiserInput.value);
    updateCaptureButton_();
});
maxScreenshotsInput.addEventListener('input', validateMaxScreenshots_);

// Capture button handler
captureBtn.addEventListener('click', async () => {
    if (!validateForm_()) {
        return;
    }
    
    setFormEnabled_(false);
    // Initial status message without animation
    showStatus_('info', 'Starting ad capture... This may may take a few minutes.'); // Initial message
    showProgress_(true);
    
    // Start the camera animation
    startCaptureAnimation();
    
    try {
        const options = {
            platform: selectedPlatform,
            region: regionSelectHidden.value,
            advertiserUrl: advertiserInput.value,
            maxScreenshots: parseInt(maxScreenshotsInput.value) || 50
        };
        
        const result = await window.electronAPI.captureScreenshots(options);
        
        // Stop the camera animation when capture is complete
        stopCaptureAnimation();

        if (result.success) {
            zipBuffer = result.zipBuffer;
            let successMessage = '';
            if (result.screenshotCount > 0 && result.videoCount > 0) {
                successMessage = `Successfully captured ${result.screenshotCount} screenshots and ${result.videoCount} video HTML files!`;
            } else if (result.screenshotCount > 0) {
                successMessage = `Successfully captured ${result.screenshotCount} screenshots!`;
            } else if (result.videoCount > 0) {
                successMessage = `Successfully captured ${result.videoCount} video HTML files!`;
            } else {
                successMessage = 'Capture completed, but no items were found.';
            }
            showStatus_('success', `${successMessage} Click the download button below.`);
            downloadBtn.style.display = 'block';
            updateProgress_(100);
        } else {
            showStatus_('error', `Error: ${result.error || 'Failed to capture ads'}`);
            showProgress_(false);
        }
    } catch (error) {
        console.error('Error capturing ads:', error);
        stopCaptureAnimation(); // Ensure animation stops on error
        showStatus_('error', `Error: ${error.message || 'An unexpected error occurred'}`);
        showProgress_(false);
    } finally {
        setFormEnabled_(true);
    }
});

// Download button handler
downloadBtn.addEventListener('click', async () => {
    if (!zipBuffer) {
        showStatus_('error', 'No ZIP file available to download');
        return;
    }
    
    try {
        const result = await window.electronAPI.saveZipFile(zipBuffer);
        
        if (result.success) {
            showStatus_('success', `File saved successfully to: ${result.path}`);
        } else if (result.canceled) {
            showStatus_('info', 'Save canceled');
        } else {
            showStatus_('error', `Error saving file: ${result.error}`);
        }
    } catch (error) {
        console.error('Error saving file:', error);
        showStatus_('error', `Error: ${error.message || 'Failed to save file'}`);
    }
});

// --- Progress Update Listener ---
// Listen for progress updates from main process
window.electronAPI.onCaptureProgress((event, message, currentCount, totalExpected) => {
    baseStatusMessage = message; // Update the base message
    
    let displayMessage = baseStatusMessage;
    if (typeof currentCount === 'number' && currentCount >= 0) {
        // Only append count if it's a number
        displayMessage = `${baseStatusMessage} (Captured: ${currentCount} items)`;
    }
    
    // Update status div content. The animation function will prepend the cameras.
    statusDiv.textContent = displayMessage;
    
    // Optionally update progress bar more accurately if totalExpected is provided
    if (typeof currentCount === 'number' && typeof totalExpected === 'number' && totalExpected > 0) {
        const percent = (currentCount / totalExpected) * 100;
        updateProgress_(percent);
    }
});

// --- Capture Animation Control ---
let captureAnimationInterval;

const startCaptureAnimation = () => {
    clearInterval(captureAnimationInterval); // Clear any existing animation interval
    currentAnimationFrame = 0; // Reset frame counter

    captureAnimationInterval = setInterval(() => {
        // Build the sequence of cameras
        let animatedCameras = '';
        for (let i = 0; i < animationLength; i++) {
            if (i < currentAnimationFrame) {
                animatedCameras += cameraEmoji;
            } else {
                animatedCameras += ' '; // Use a space for 'empty' camera slots to maintain length
            }
        }

        // Prepend the animated cameras to the base status message
        // Ensure the baseStatusMessage content is correctly retained by showStatus_ and onCaptureProgress
        statusDiv.textContent = `${animatedCameras} ${baseStatusMessage}`;

        currentAnimationFrame++;
        if (currentAnimationFrame > animationLength) {
            currentAnimationFrame = 0; // Loop back to the start of the animation
        }
    }, 200); // Adjust speed of animation (e.g., every 200ms)
};

const stopCaptureAnimation = () => {
    clearInterval(captureAnimationInterval);
    // Restore the status text to just the base message (without any cameras)
    statusDiv.textContent = baseStatusMessage;
};


// --- Initialization ---

// Populate the custom dropdown on load
populateCustomRegionSelect();

// Set initial selected value for the custom dropdown if one was saved
const initialSelectedCode = localStorage.getItem(LAST_SELECTED_REGION_KEY);
if (initialSelectedCode) {
    const selectedCountry = allCountries.find(c => c.code === initialSelectedCode);
    if (selectedCountry) {
        selectedRegionText.textContent = selectedCountry.name;
        regionSelectHidden.value = selectedCountry.code;
    }
}

// Initialize button state
updateCaptureButton_();