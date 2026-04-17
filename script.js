const { useEffect, useRef, useState } = React;

const books = [
    {
        id: 1,
        title: "Мастер и Маргарита",
        cover: "data:image/svg+xml;utf8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
                <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#2d1f1f"/>
                        <stop offset="100%" stop-color="#8c3b2a"/>
                    </linearGradient>
                </defs>
                <rect width="800" height="600" fill="url(#g1)"/>
                <circle cx="620" cy="150" r="70" fill="#f7d68b" opacity="0.9"/>
                <text x="70" y="240" fill="#fff3d6" font-size="62" font-family="Georgia">Мастер</text>
                <text x="70" y="320" fill="#fff3d6" font-size="62" font-family="Georgia">и Маргарита</text>
                <text x="70" y="430" fill="#f4d8c8" font-size="28" font-family="Arial">М. Булгаков</text>
            </svg>
        `),
        description: "Роман переносит читателя сразу в несколько миров: в московскую реальность, в мистическую историю Воланда и в трагическую линию Понтия Пилата. Сюжет развивается насыщенно, но при этом очень цельно, поэтому книга держит внимание с первых страниц. В произведении переплетаются любовь, свобода, страх, ирония и философские размышления о природе человека. Даже второстепенные персонажи здесь запоминаются благодаря ярким деталям и необычным поступкам. Текст дает возможность не только следить за событиями, но и постоянно находить новые смыслы при повторном чтении. Именно поэтому роман считают одним из самых обсуждаемых произведений русской литературы."
    },
    {
        id: 2,
        title: "1984",
        cover: "data:image/svg+xml;utf8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
                <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#102235"/>
                        <stop offset="100%" stop-color="#375f87"/>
                    </linearGradient>
                </defs>
                <rect width="800" height="600" fill="url(#g2)"/>
                <rect x="520" y="90" width="150" height="150" rx="75" fill="#dfe8f0" opacity="0.9"/>
                <circle cx="575" cy="155" r="20" fill="#102235"/>
                <circle cx="615" cy="155" r="20" fill="#102235"/>
                <text x="70" y="260" fill="#eef5fb" font-size="92" font-family="Arial" font-weight="700">1984</text>
                <text x="70" y="360" fill="#d9e7f2" font-size="34" font-family="Arial">George Orwell</text>
            </svg>
        `),
        description: "Это антиутопия о мире, в котором контроль государства проникает в мысли, речь и повседневную жизнь человека. Главный герой пытается сохранить внутреннюю свободу, хотя система устроена так, чтобы подавлять любое инакомыслие. Книга показывает, как язык, страх и постоянное наблюдение могут превращаться в инструменты власти. При чтении особенно заметно, что многие идеи романа остаются актуальными и сегодня. Произведение написано достаточно просто, поэтому его удобно анализировать даже без глубокого литературоведческого опыта. При этом после прочтения остаётся сильное ощущение тревоги и желание обсудить поднятые автором вопросы."
    },
    {
        id: 3,
        title: "Маленький принц",
        cover: "data:image/svg+xml;utf8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
                <defs>
                    <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#14324a"/>
                        <stop offset="100%" stop-color="#286a7a"/>
                    </linearGradient>
                </defs>
                <rect width="800" height="600" fill="url(#g3)"/>
                <circle cx="620" cy="150" r="64" fill="#ffe79d"/>
                <circle cx="640" cy="360" r="56" fill="#d8b46b"/>
                <text x="70" y="230" fill="#f7f2e5" font-size="54" font-family="Georgia">Маленький</text>
                <text x="70" y="305" fill="#f7f2e5" font-size="54" font-family="Georgia">принц</text>
                <text x="70" y="410" fill="#d7ebef" font-size="28" font-family="Arial">А. де Сент-Экзюпери</text>
            </svg>
        `),
        description: "На первый взгляд это короткая сказка, но в ней скрыто много размышлений о дружбе, ответственности и умении видеть главное. Автор использует простые образы, благодаря которым текст легко читается и хорошо запоминается. История путешествия по разным планетам показывает человеческие качества через очень понятные и символичные ситуации. Взрослый читатель видит в книге философскую глубину, а ребёнок воспринимает её как добрую и красивую историю. Именно такой двойной уровень восприятия делает произведение универсальным. После чтения остаётся ощущение тепла и желание вернуться к самым важным мыслям ещё раз."
    }
];

function BookCard({ book }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState("0px");
    const descriptionRef = useRef(null);

    useEffect(() => {
        const updateHeight = () => {
            if (!descriptionRef.current) {
                return;
            }

            const styles = window.getComputedStyle(descriptionRef.current);
            const lineHeight = parseFloat(styles.lineHeight);
            const fullHeight = descriptionRef.current.scrollHeight;

            setMaxHeight(`${isExpanded ? fullHeight : lineHeight}px`);
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);

        return () => {
            window.removeEventListener("resize", updateHeight);
        };
    }, [isExpanded, book.description]);

    return (
        <article className="book-card">
            <img className="book-card__cover" src={book.cover} alt={`Обложка книги ${book.title}`} />

            <div className="book-card__content">
                <h2 className="book-card__title">{book.title}</h2>

                <div
                    className="book-card__description"
                    style={{ maxHeight }}
                >
                    <p ref={descriptionRef} className="book-card__description-text">
                        {book.description}
                    </p>
                </div>

                <button
                    type="button"
                    className="book-card__button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                >
                    {isExpanded ? "Свернуть" : "Развернуть"}
                </button>
            </div>
        </article>
    );
}

function App() {
    return (
        <main className="page">
            <section className="hero">
                <h1 className="hero__title">Список книг с компонентом "подробнее"</h1>
                <p className="hero__text">
                    На странице показан список книг с обложкой, названием и длинным описанием.
                    По умолчанию текст скрыт до одной строки, а по кнопке его можно плавно
                    развернуть и свернуть обратно.
                </p>
            </section>

            <section className="books-list">
                {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </section>
        </main>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
