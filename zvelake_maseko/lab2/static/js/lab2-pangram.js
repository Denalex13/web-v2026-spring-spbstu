
function isPangram(word, lang = 'ru') {
    const alphabets = {
        ru: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
        en: "abcdefghijklmnopqrstuvwxyz"
    };
    
    const alphabet = alphabets[lang];
    const lowerWord = new Set(word.toLowerCase());
    
    return [...alphabet].every(letter => lowerWord.has(letter));
}


let testPhrases = [
    {
        lang: 'ru',
        phrase: 'Съешь же ещё этих мягких французских булок, да выпей чаю'
    },
    {
        lang: 'en',
        phrase: 'The quick brown fox jumps over the lazy dog'
    },
    {
        lang: 'ru',
        phrase: 'фраза или предложение, в котором используются все буквы алфавита'
    },
]

function makeAltert(messageHtml,type='success'){
    let d = document.createElement('div');
    d.className = 'alert ' + type;
    d.innerHTML = messageHtml;
    return d;
}

function initializeExamples(){
    let container = document.querySelector('.examples');
    let ul = document.createElement('ul');
    ul.innerHTML += testPhrases.map(p => {
        const ok = isPangram(p.phrase, p.lang);
        return `<li>${p.phrase} [${p.lang}]: ${ok ? 'Да' : 'нет'}</li>`;
    }).join('');
    container.appendChild(ul);
}

function clearAlerts(){
    document.querySelectorAll('.alert').forEach(al => al.remove());
}

document.addEventListener('DOMContentLoaded', ()=>{
    initializeExamples();
    let submitBtn = document.querySelector('#submitButton');
    let form = document.querySelector('form');
    
    form.addEventListener('submit', function(e){
        e.preventDefault();
        clearAlerts();
        
        let formData = new FormData(form);
        let lang = formData.get('language');
        let phrase = formData.get('word');
        if(phrase.length === 0){
            form.appendChild(makeAltert('<P>поле пустой</p>', 'error'));
            setTimeout(()=>{clearAlerts();}, 2000);
            return;
        }
        submitBtn.disabled = true;
        document.querySelector('.loader').style.setProperty('display', 'block');
        
        let result = isPangram(phrase, lang);
        let responseMessage = `<p>${result[0] ? '<i class="fa-solid fa-circle-check"></i><span>Является панграммой</span>' : '<i class="fa-solid fa-x"></i><span>Не Является панграммой</span>'}</p>`;
        setTimeout(()=>{
            document.querySelector('.loader').style.removeProperty('display');
            form.appendChild(makeAltert(responseMessage));
            submitBtn.disabled = false;
        }, 3000);
    });
})
