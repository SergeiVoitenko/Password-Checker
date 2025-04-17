// Расширенный список поширених паролів
const commonPasswords = [
    // Английские распространенные пароли
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567", 
    "letmein", "trustno1", "dragon", "baseball", "111111", "iloveyou", "master", 
    "sunshine", "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", 
    "superman", "qazwsx", "michael", "Football", "welcome", "admin", "pass",
    // Украинские/русские распространенные имена и шаблоны
    "сережа", "сергей", "серега", "admin123", "qwerty123", "password123", "111222", "222333",
    "qwe123", "андрей", "александр", "дмитрий", "максим", "иван", "михаил", "олександр",
    "дмитро", "микола", "тарас", "богдан", "віталій", "олег", "вадим", "василь",
    // Распространенные конструкции
    "привет", "пароль", "секрет", "любовь", "друг", "кошка", "собака", "машина",
    "работа", "дом", "семья", "ребенок", "солнце", "звезда", "луна", "небо",
    // Популярные имена с числами
    "сережа123", "андрей123", "максим123", "иван123", "саша123", "дима123",
    // Годы
    "12345", "123456789", "2020", "2021", "2022", "2023", "2024", "2025",
    // Дополнительно
    "password1", "11111111", "987654321", "qwerty1", "1q2w3e", "1q2w3e4r", "1qaz2wsx",
    "абвгд", "йцукен", "фыва", "ячсм", "zxcvbn", "asdfgh", "qwertyuiop", "asdfghjkl"
];

// Отримання елементів DOM
const passwordInput = document.getElementById('password-input');
const strengthMeter = document.getElementById('strength-meter');
const strengthText = document.getElementById('strength-text');
const generateBtn = document.getElementById('generate-btn');
const feedbackElement = document.getElementById('feedback');
const togglePasswordBtn = document.getElementById('toggle-password');
const copyBtn = document.getElementById('copy-btn');

// Іконки для вимог
const lengthIcon = document.getElementById('length-icon');
const uppercaseIcon = document.getElementById('uppercase-icon');
const lowercaseIcon = document.getElementById('lowercase-icon');
const numberIcon = document.getElementById('number-icon');
const specialIcon = document.getElementById('special-icon');
const commonIcon = document.getElementById('common-icon');

// Обробник події введення пароля
passwordInput.addEventListener('input', checkPassword);

// Обробник події натискання на кнопку генерації пароля
generateBtn.addEventListener('click', generatePassword);

// Обробник події натискання на кнопку показу/приховування пароля
togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

// Обробник події натискання на кнопку копіювання пароля
copyBtn.addEventListener('click', copyPassword);

// Функція показу/приховування пароля
function togglePasswordVisibility() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        togglePasswordBtn.textContent = '👁️';
    }
}

// Функція копіювання пароля
function copyPassword() {
    if (passwordInput.value) {
        navigator.clipboard.writeText(passwordInput.value)
            .then(() => {
                // Тимчасова зміна тексту кнопки для зворотного зв'язку
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопійовано!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Не вдалося скопіювати пароль: ', err);
                // Запасний варіант для пристроїв без підтримки clipboard API
                const tempInput = document.createElement('input');
                tempInput.value = passwordInput.value;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопійовано!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
    }
}

// Функція перевірки пароля
function checkPassword() {
    const password = passwordInput.value;
    
    // Перевірка вимог
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-ZА-ЯЁЇІЄҐ]/u.test(password);
    const hasLowerCase = /[a-zа-яёїієґ]/u.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isCommon = commonPasswords.includes(password.toLowerCase());
    
    // Оновлення індикаторів для вимог
    updateRequirementIcon(lengthIcon, hasLength);
    updateRequirementIcon(uppercaseIcon, hasUpperCase);
    updateRequirementIcon(lowercaseIcon, hasLowerCase);
    updateRequirementIcon(numberIcon, hasNumber);
    updateRequirementIcon(specialIcon, hasSpecial);
    updateRequirementIcon(commonIcon, !isCommon);
    
    // Використання бібліотеки zxcvbn для оцінки надійності
    let result = { score: 0, feedback: { warning: '', suggestions: [] } };
    
    if (password) {
        result = zxcvbn(password);
        
        // Додаткова перевірка на популярні імена та комбінації імені з цифрами
        const containsCommonName = /^[А-ЯІЇЄҐA-Z][а-яіїєґa-z]{2,}[0-9]*$/.test(password);
        
        // Перевірка на послідовності чисел (123, 321, 789 тощо)
        const hasSequentialNumbers = /(?:012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(password);
        
        // Перевірка на повторювані числа (111, 222 тощо)
        const hasRepeatedNumbers = /([0-9])\1{2,}/.test(password);
        
        // Перевірка на типові шаблони "им'я + цифри"
        const hasNameNumberPattern = /^[А-ЯІЇЄҐA-Z][а-яіїєґa-z]{2,}[0-9]{1,6}$/.test(password);
        
        // Знизити оцінку якщо не виконуються всі основні вимоги
        const allBasicRequirementsMet = hasLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial && !isCommon;
        
        // Модифікація оцінки на основі додаткових факторів
        if (containsCommonName) {
            result.score = Math.max(0, result.score - 1);
            if (!result.feedback.warning) {
                result.feedback.warning = "Пароль містить розпізнаване ім'я";
            }
            result.feedback.suggestions.push("Уникайте використання імен у паролях");
        }
        
        if (hasSequentialNumbers) {
            result.score = Math.max(0, result.score - 1);
            if (!result.feedback.warning) {
                result.feedback.warning = "Пароль містить послідовність чисел";
            }
            result.feedback.suggestions.push("Уникайте послідовних чисел (123, 789 тощо)");
        }
        
        if (hasRepeatedNumbers) {
            result.score = Math.max(0, result.score - 1);
            if (!result.feedback.warning) {
                result.feedback.warning = "Пароль містить повторювані числа";
            }
            result.feedback.suggestions.push("Уникайте повторюваних чисел (111, 222 тощо)");
        }
        
        if (hasNameNumberPattern) {
            result.score = Math.max(0, result.score - 1);
            if (!result.feedback.warning) {
                result.feedback.warning = "Пароль містить типовий шаблон 'ім'я + цифри'";
            }
            result.feedback.suggestions.push("Не використовуйте комбінацію імені з цифрами");
        }
        
        // Максимальна оцінка обмежена, якщо не виконуються всі вимоги
        if (!allBasicRequirementsMet) {
            result.score = Math.min(result.score, 2); // Обмежити до "Середній" якщо не всі вимоги виконані
            if (!result.feedback.warning) {
                result.feedback.warning = "Пароль не відповідає всім вимогам безпеки";
            }
            result.feedback.suggestions.push("Виконайте всі вимоги для створення дійсно надійного пароля");
        }
        
        // Чи пароль містить тільки літери або тільки цифри?
        if (/^[A-Za-zА-Яа-яІЇЄҐіїєґ]+$/.test(password) || /^[0-9]+$/.test(password)) {
            result.score = Math.min(result.score, 1); // Обмежити до "Слабкий"
            if (!result.feedback.warning) {
                result.feedback.warning = "Пароль містить тільки літери або тільки цифри";
            }
            result.feedback.suggestions.push("Додайте різні типи символів до пароля");
        }
    }
    
    // Оновлення індикатора надійності
    updateStrengthMeter(result.score);
    
    // Оновлення тексту зворотного зв'язку
    updateFeedback(result);
}

// Функція оновлення індикатора для вимоги
function updateRequirementIcon(icon, isMet) {
    if (isMet) {
        icon.textContent = '✓';
        icon.classList.add('met');
    } else {
        icon.textContent = '○';
        icon.classList.remove('met');
    }
}

// Функція оновлення індикатора надійності
function updateStrengthMeter(score) {
    let strengthPercentage = (score / 4) * 100;
    let strengthColor = '';
    let strengthLabel = '';
    
    // Модифікована шкала для кращого розуміння
    switch (score) {
        case 0:
            strengthLabel = 'Дуже слабкий';
            strengthColor = '#ff4d4d'; // Яскраво-червоний
            break;
        case 1:
            strengthLabel = 'Слабкий';
            strengthColor = '#ff9966'; // Оранжевий
            break;
        case 2:
            strengthLabel = 'Середній';
            strengthColor = '#ffcc00'; // Жовтий
            break;
        case 3:
            strengthLabel = 'Надійний';
            strengthColor = '#66cc66'; // Зелений
            break;
        case 4:
            strengthLabel = 'Дуже надійний';
            strengthColor = '#009933'; // Темно-зелений
            break;
    }
    
    // Підтримка темного режиму
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        switch (score) {
            case 0:
                strengthColor = '#ff4d4d'; // Червоний
                break;
            case 1:
                strengthColor = '#ff9966'; // Оранжевий
                break;
            case 2:
                strengthColor = '#ffcc00'; // Жовтий
                break;
            case 3:
                strengthColor = '#66cc66'; // Зелений
                break;
            case 4:
                strengthColor = '#00cc66'; // Яскраво-зелений
                break;
        }
    }
    
    strengthMeter.style.width = strengthPercentage + '%';
    strengthMeter.style.backgroundColor = strengthColor;
    strengthText.textContent = 'Сила пароля: ' + strengthLabel;
    strengthText.className = ''; // Скидання класів
    
    // Додати відповідний клас залежно від оцінки
    if (score <= 1) {
        strengthText.classList.add('weak');
    } else if (score === 2) {
        strengthText.classList.add('medium');
    } else if (score === 3) {
        strengthText.classList.add('strong');
    } else if (score === 4) {
        strengthText.classList.add('very-strong');
    }
}

// Функція оновлення зворотного зв'язку
function updateFeedback(result) {
    feedbackElement.style.display = 'block';
    
    let feedbackText = '';
    
    if (result.feedback.warning) {
        feedbackText += '<strong>Попередження:</strong> ' + translateWarning(result.feedback.warning) + '<br>';
    }
    
    if (result.feedback.suggestions.length > 0) {
        feedbackText += '<strong>Рекомендації:</strong><ul>';
        result.feedback.suggestions.forEach(suggestion => {
            feedbackText += '<li>' + translateSuggestion(suggestion) + '</li>';
        });
        feedbackText += '</ul>';
    }
    
    if (!feedbackText) {
        if (result.score >= 3) {
            feedbackText = 'Чудовий пароль! Його буде важко зламати.';
        } else if (passwordInput.value) {
            feedbackText = 'Рекомендується посилити пароль, дотримуючись зазначених вище вимог.';
        } else {
            feedbackElement.style.display = 'none';
        }
    }
    
    feedbackElement.innerHTML = feedbackText;
}

// Переклад попереджень zxcvbn
function translateWarning(warning) {
    const translations = {
        'Straight rows of keys are easy to guess': 'Послідовний ряд клавіш легко вгадати',
        'Short keyboard patterns are easy to guess': 'Короткі клавіатурні шаблони легко вгадати',
        'Repeats like "aaa" are easy to guess': 'Повторення на кшталт "aaa" легко вгадати',
        'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': 'Повторення на кшталт "abcabcabc" лише трохи складніше вгадати, ніж "abc"',
        'Sequences like "abc" or "6543" are easy to guess': 'Послідовності на кшталт "abc" або "6543" легко вгадати',
        'Recent years are easy to guess': 'Нещодавні роки легко вгадати',
        'Dates are often easy to guess': 'Дати часто легко вгадати',
        'This is a top-10 common password': 'Це один із 10 найпоширеніших паролів',
        'This is a top-100 common password': 'Це один із 100 найпоширеніших паролів',
        'This is a very common password': 'Це дуже поширений пароль',
        'This is similar to a commonly used password': 'Це схоже на часто використовуваний пароль',
        'A word by itself is easy to guess': 'Окреме слово легко вгадати',
        'Names and surnames by themselves are easy to guess': 'Імена та прізвища самі по собі легко вгадати',
        'Common names and surnames are easy to guess': 'Поширені імена та прізвища легко вгадати',
        'Пароль містить розпізнаване ім\'я': 'Пароль містить розпізнаване ім\'я',
        'Пароль містить послідовність чисел': 'Пароль містить послідовність чисел',
        'Пароль містить повторювані числа': 'Пароль містить повторювані числа',
        'Пароль містить типовий шаблон \'ім\'я + цифри\'': 'Пароль містить типовий шаблон \'ім\'я + цифри\'',
        'Пароль не відповідає всім вимогам безпеки': 'Пароль не відповідає всім вимогам безпеки',
        'Пароль містить тільки літери або тільки цифри': 'Пароль містить тільки літери або тільки цифри'
    };
    
    return translations[warning] || warning;
}

// Переклад рекомендацій zxcvbn
function translateSuggestion(suggestion) {
    const translations = {
        'Use a longer keyboard pattern with more turns': 'Використовуйте довший клавіатурний шаблон з більшою кількістю поворотів',
        'Use a longer password': 'Використовуйте довший пароль',
        'Avoid repeated words and characters': 'Уникайте повторюваних слів і символів',
        'Avoid sequences': 'Уникайте послідовностей',
        'Avoid recent years': 'Уникайте нещодавніх років',
        'Avoid years that are associated with you': 'Уникайте років, які пов\'язані з вами',
        'Avoid dates and years that are associated with you': 'Уникайте дат і років, які пов\'язані з вами',
        'Add another word or two. Uncommon words are better.': 'Додайте ще одне або два слова. Рідковживані слова кращі.',
        'Capitalization doesn\'t help very much': 'Використання великих літер не дуже допомагає',
        'All-uppercase is almost as easy to guess as all-lowercase': 'Всі великі літери майже так само легко вгадати, як і всі малі',
        'Reversed words aren\'t much harder to guess': 'Зворотні слова ненабагато складніше вгадати',
        'Predictable substitutions like \'@\' instead of \'a\' don\'t help very much': 'Передбачувані заміни, такі як \'@\' замість \'a\', не дуже допомагають',
        'Уникайте використання імен у паролях': 'Уникайте використання імен у паролях',
        'Уникайте послідовних чисел (123, 789 тощо)': 'Уникайте послідовних чисел (123, 789 тощо)',
        'Уникайте повторюваних чисел (111, 222 тощо)': 'Уникайте повторюваних чисел (111, 222 тощо)',
        'Не використовуйте комбінацію імені з цифрами': 'Не використовуйте комбінацію імені з цифрами',
        'Виконайте всі вимоги для створення дійсно надійного пароля': 'Виконайте всі вимоги для створення дійсно надійного пароля',
        'Додайте різні типи символів до пароля': 'Додайте різні типи символів до пароля'
    };
    
    return translations[suggestion] || suggestion;
}

// Функція генерації випадкового пароля
function generatePassword() {
    const length = 12; // Довжина генерованого пароля
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    
    // Генерація пароля
    let password = '';
    
    // Додавання по одному символу кожного типу
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Додавання решти символів
    for (let i = 4; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Перемішування пароля
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    // Встановлення згенерованого пароля в поле вводу та перевірка його
    passwordInput.value = password;
    
    // Якщо пароль згенеровано, автоматично показуємо його
    if (passwordInput.type === 'password') {
        togglePasswordVisibility();
    }
    
    checkPassword();
}

// Функція для перевірки пароля через API Have I Been Pwned
async function checkPwnedPassword(password) {
    try {
        // Отримання SHA-1 хешу пароля
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        
        // Перетворення хешу в шістнадцятковий формат
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        // Розділяємо хеш на префікс (перші 5 символів) і залишок
        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5);
        
        // Надсилаємо запит до API Have I Been Pwned
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        if (!response.ok) {
            throw new Error('Помилка при запиті до API Have I Been Pwned');
        }
        
        const text = await response.text();
        const hashes = text.split('\r\n');
        
        // Шукаємо наш суфікс хешу у відповіді
        for (const hash of hashes) {
            const [hashSuffix, count] = hash.split(':');
            if (hashSuffix === suffix) {
                return parseInt(count, 10); // Кількість витоків
            }
        }
        
        return 0; // Пароль не знайдено у витоках
    } catch (error) {
        console.error('Помилка при перевірці пароля:', error);
        return -1; // Помилка при перевірці
    }
}

// Додаємо новий елемент для відображення результату перевірки
const passwordRequirements = document.querySelector('.password-info');
const pwnedCheckElement = document.createElement('div');
pwnedCheckElement.classList.add('requirement');
pwnedCheckElement.innerHTML = `
    <span id="pwned-icon" class="requirement-icon">○</span>
    <span class="requirement-text">Не знайдено у витоках даних</span>
`;
passwordRequirements.appendChild(pwnedCheckElement);

const pwnedIcon = document.getElementById('pwned-icon');

// Оновлюємо функцію перевірки пароля
const originalCheckPassword = checkPassword;
checkPassword = async function() {
    originalCheckPassword();
    
    const password = passwordInput.value;
    
    if (password.length >= 1) {
        pwnedIcon.textContent = '⏳'; // Індикатор завантаження
        
        const count = await checkPwnedPassword(password);
        
        if (count > 0) {
            pwnedIcon.textContent = '✗';
            pwnedIcon.classList.remove('met');
            pwnedIcon.nextElementSibling.textContent = `Знайдено у ${count} витоках даних!`;
            
            // Додаємо попередження у зворотний зв'язок
            const pwdFeedback = document.createElement('p');
            pwdFeedback.innerHTML = `<strong>Увага:</strong> Цей пароль знайдено у ${count} витоках даних. Рекомендується використовувати інший пароль.`;
            
            const existingPwnedWarning = Array.from(feedbackElement.querySelectorAll('p')).find(p => p.textContent.includes('витоках даних'));
            if (!existingPwnedWarning) {
                feedbackElement.appendChild(pwdFeedback);
                feedbackElement.style.display = 'block';
            }
        } else if (count === 0) {
            pwnedIcon.textContent = '✓';
            pwnedIcon.classList.add('met');
            pwnedIcon.nextElementSibling.textContent = 'Не знайдено у витоках даних';
            
            // Видаляємо попередження якщо воно є
            const existingPwnedWarning = Array.from(feedbackElement.querySelectorAll('p')).find(p => p.textContent.includes('витоках даних'));
            if (existingPwnedWarning) {
                feedbackElement.removeChild(existingPwnedWarning);
            }
        } else {
            pwnedIcon.textContent = '!';
            pwnedIcon.classList.remove('met');
            pwnedIcon.nextElementSibling.textContent = 'Не вдалося перевірити у базі витоків';
        }
    } else {
        pwnedIcon.textContent = '○';
        pwnedIcon.classList.remove('met');
        pwnedIcon.nextElementSibling.textContent = 'Не знайдено у витоках даних';
    }
};

// Додаємо слухач подій для виявлення змін у вподобаннях теми
if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', () => {
        // Перемальовування індикатора надійності при зміні теми
        checkPassword();
    });
}

// Додаємо обробку мобільних подій
document.addEventListener('touchstart', function() {
    // Порожня функція для покращення відгучності на мобільних пристроях
}, false);

// Ініціалізація перевірки пароля
checkPassword();
