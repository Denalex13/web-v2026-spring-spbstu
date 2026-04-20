function slidingWindowSums(arr, k) {
    // Проверка на некорректные входные данные
    if (!Array.isArray(arr) || arr.length === 0 || k <= 0 || k > arr.length) {
        return [];
    }
    
    const result = [];
    let windowSum = 0;
    
    // Считаем сумму первого окна
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    result.push(windowSum);
    
    // Скользим окном по массиву
    for (let i = k; i < arr.length; i++) {
        // Убираем левый элемент, добавляем правый
        windowSum = windowSum - arr[i - k] + arr[i];
        result.push(windowSum);
    }
    
    return result;
}

// ========== ТЕСТЫ ==========
console.log('=== Лабораторная работа №3: Sliding Window Sums ===\n');

// Тест 1: Базовый пример
console.log('Тест 1:', slidingWindowSums([1, 2, 3, 4, 5, 6], 3));
// Ожидаем: [1+2+3=6, 2+3+4=9, 3+4+5=12, 4+5+6=15] → [6, 9, 12, 15]

// Тест 2: Окно = 1
console.log('Тест 2:', slidingWindowSums([10, 20, 30, 40], 1));
// Ожидаем: [10, 20, 30, 40]

// Тест 3: Окно = длине массива
console.log('Тест 3:', slidingWindowSums([5, 5, 5], 3));
// Ожидаем: [15]

// Тест 4: Отрицательные числа
console.log('Тест 4:', slidingWindowSums([-1, 2, -3, 4, -5], 2));
// Ожидаем: [1, -1, 1, -1]

// Тест 5: Пустой массив
console.log('Тест 5:', slidingWindowSums([], 2));
// Ожидаем: []

// Тест 6: k больше длины массива
console.log('Тест 6:', slidingWindowSums([1, 2, 3], 5));
// Ожидаем: []

// Тест 7: Большой массив
console.log('Тест 7:', slidingWindowSums([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 4));
// Ожидаем: [4, 4, 4, 4, 4, 4, 4]

console.log('\n=== Все тесты выполнены ===');