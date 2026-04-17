class Channel {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.subscribers = [];
    }

    addSubscriber(name) {
        if (!name || typeof name !== 'string') return false;
        if (!this.subscribers.includes(name)) {
            this.subscribers.push(name);
            return true;
        }
        return false;
    }

    removeSubscriber(name) {
        const index = this.subscribers.indexOf(name);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
            return true;
        }
        return false;
    }

    get subscriberCount() {
        return this.subscribers.length;
    }
}

let channels = [];

function showMessage(text, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isError ? 'error-message' : 'success-message';
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function saveToLocalStorage() {
    const dataToStore = channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        subscribers: [...ch.subscribers]
    }));
    localStorage.setItem('channelsData', JSON.stringify(dataToStore));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('channelsData');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            channels = parsed.map(item => {
                const ch = new Channel(item.id, item.name);
                ch.subscribers = [...item.subscribers];
                return ch;
            });
        } catch (e) {
            console.error("Ошибка загрузки", e);
        }
    }
    
    if (channels.length === 0) {
        const demo1 = new Channel(1, "JavaScript Блог");
        demo1.addSubscriber("Анна");
        demo1.addSubscriber("Иван");
        
        const demo2 = new Channel(2, "Кулинария");
        demo2.addSubscriber("Анна");
        demo2.addSubscriber("Петр");
        demo2.addSubscriber("Ольга");
        
        const demo3 = new Channel(3, "Путешествия");
        demo3.addSubscriber("Мария");
        
        channels = [demo1, demo2, demo3];
    }
}

function asyncAddSubscriber(channel, subscriberName) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = channel.addSubscriber(subscriberName);
            if (result) {
                resolve({ 
                    success: true, 
                    message: `Подписчик ${subscriberName} добавлен на канал ${channel.name}` 
                });
            } else {
                reject({ 
                    success: false, 
                    message: `Не удалось добавить ${subscriberName} (уже существует или имя неверно)` 
                });
            }
        }, 500);
    });
}

function asyncRemoveSubscriber(channel, subscriberName) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = channel.removeSubscriber(subscriberName);
            if (result) {
                resolve({ 
                    success: true, 
                    message: `Подписчик ${subscriberName} удалён с канала ${channel.name}` 
                });
            } else {
                reject({ 
                    success: false, 
                    message: `Подписчик ${subscriberName} не найден на канале ${channel.name}` 
                });
            }
        }, 300);
    });
}

function asyncAddChannel(channelName) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!channelName.trim()) {
                reject({ success: false, message: "Название канала не может быть пустым" });
                return;
            }
            const newId = channels.length > 0 ? Math.max(...channels.map(c => c.id)) + 1 : 1;
            const newChannel = new Channel(newId, channelName.trim());
            channels.push(newChannel);
            resolve({ 
                success: true, 
                message: `Канал "${channelName}" создан`, 
                channel: newChannel 
            });
        }, 500);
    });
}

function asyncRemoveChannel(channelId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = channels.findIndex(ch => ch.id === channelId);
            if (index !== -1) {
                const removed = channels[index];
                channels.splice(index, 1);
                resolve({ 
                    success: true, 
                    message: `Канал "${removed.name}" удалён`, 
                    removedChannel: removed 
                });
            } else {
                reject({ success: false, message: "Канал не найден" });
            }
        }, 500);
    });
}

function groupChannelsBySubscriberCount() {
    const groups = {};
    channels.forEach(ch => {
        const count = ch.subscriberCount;
        if (!groups[count]) groups[count] = [];
        groups[count].push(ch);
    });
    return groups;
}

function getAllUniqueSubscribers() {
    const all = [];
    channels.forEach(ch => {
        ch.subscribers.forEach(sub => {
            if (!all.includes(sub)) all.push(sub);
        });
    });
    return all;
}

function getChannelsWithSubscriber(subscriberName) {
    return channels.filter(ch => ch.subscribers.includes(subscriberName));
}

function groupSubscribersByChannels() {
    const map = new Map();
    channels.forEach(ch => {
        ch.subscribers.forEach(sub => {
            if (!map.has(sub)) map.set(sub, []);
            map.get(sub).push(ch.name);
        });
    });
    return map;
}

function getChannelsWithMaxSubscribers() {
    if (channels.length === 0) return [];
    const maxCount = Math.max(...channels.map(ch => ch.subscriberCount));
    return channels.filter(ch => ch.subscriberCount === maxCount);
}

function updateStatsPanel() {
    const statsPanel = document.getElementById('statsPanel');
    const uniqueSubs = getAllUniqueSubscribers();
    const maxSubChannels = getChannelsWithMaxSubscribers();
    const groups = groupChannelsBySubscriberCount();
    const subToChannels = groupSubscribersByChannels();
    
    const groupsText = Object.entries(groups)
        .map(([count, chs]) => `${count}: ${chs.length}`)
        .join(', ');
    
    const popularText = Array.from(subToChannels.entries())
        .slice(0, 3)
        .map(([sub, chs]) => `${sub} (${chs.length})`)
        .join(', ');
    
    statsPanel.innerHTML = `
        <div><strong>Всего каналов:</strong> ${channels.length}</div>
        <div><strong>Уникальных подписчиков:</strong> ${uniqueSubs.length}</div>
        <div><strong>Макс. подписчиков:</strong> ${maxSubChannels.map(ch => ch.name).join(', ') || '-'}</div>
        <div><strong>Группировка по подписчикам:</strong> ${groupsText}</div>
        <div><strong>Популярные подписчики:</strong> ${popularText}</div>
    `;
}

function updateSelects() {
    const channelSelect = document.getElementById('channelSelectForSub');
    const deleteSelect = document.getElementById('deleteChannelSelect');
    
    const options = channels.map(ch => 
        `<option value="${ch.id}">${escapeHtml(ch.name)} (${ch.subscriberCount})</option>`
    );
    
    channelSelect.innerHTML = '<option value="">-- Выберите канал --</option>' + options.join('');
    deleteSelect.innerHTML = '<option value="">-- Выберите канал --</option>' + options.join('');
}

function renderChannels() {
    const container = document.getElementById('channelsContainer');
    container.innerHTML = '';
    
    channels.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <h3>${escapeHtml(channel.name)}</h3>
            <div class="sub-count">Подписчиков: ${channel.subscriberCount}</div>
            <ul class="sub-list">
                ${channel.subscribers.map(sub => `
                    <li>
                        <span>${escapeHtml(sub)}</span>
                        <button class="remove-sub" data-channel-id="${channel.id}" data-sub-name="${escapeHtml(sub)}">[X]</button>
                    </li>
                `).join('')}
                ${channel.subscribers.length === 0 ? '<li style="color: #999;">Нет подписчиков</li>' : ''}
            </ul>
            <div class="add-sub-form">
                <input type="text" placeholder="Имя подписчика" class="new-sub-name" data-channel-id="${channel.id}">
                <button class="add-sub-btn" data-channel-id="${channel.id}">Добавить</button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    document.querySelectorAll('.remove-sub').forEach(btn => {
        btn.addEventListener('click', async () => {
            const channelId = parseInt(btn.dataset.channelId);
            const subName = btn.dataset.subName;
            const channel = channels.find(ch => ch.id === channelId);
            if (channel) {
                try {
                    await asyncRemoveSubscriber(channel, subName);
                    updateUI();
                    showMessage(`Подписчик ${subName} удалён`);
                } catch (error) {
                    showMessage(error.message, true);
                }
            }
        });
    });
    
    document.querySelectorAll('.add-sub-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const channelId = parseInt(btn.dataset.channelId);
            const input = btn.parentElement.querySelector('.new-sub-name');
            const subName = input.value.trim();
            const channel = channels.find(ch => ch.id === channelId);
            if (channel && subName) {
                try {
                    await asyncAddSubscriber(channel, subName);
                    updateUI();
                    showMessage(`Подписчик ${subName} добавлен`);
                    input.value = '';
                } catch (error) {
                    showMessage(error.message, true);
                }
            }
        });
    });
}

function updateUI() {
    renderChannels();
    updateStatsPanel();
    updateSelects();
    saveToLocalStorage();
}

async function init() {
    loadFromLocalStorage();
    updateUI();
    
    document.getElementById('createChannelBtn').addEventListener('click', async () => {
        const nameInput = document.getElementById('channelName');
        const name = nameInput.value.trim();
        if (name) {
            try {
                await asyncAddChannel(name);
                updateUI();
                showMessage(`Канал "${name}" создан`);
                nameInput.value = '';
            } catch (error) {
                showMessage(error.message, true);
            }
        } else {
            showMessage('Введите название канала', true);
        }
    });
    
    document.getElementById('addSubGlobalBtn').addEventListener('click', async () => {
        const subName = document.getElementById('globalSubName').value.trim();
        const channelId = document.getElementById('channelSelectForSub').value;
        const channel = channels.find(ch => ch.id === parseInt(channelId));
        
        if (channel && subName) {
            try {
                await asyncAddSubscriber(channel, subName);
                updateUI();
                showMessage(`Подписчик ${subName} добавлен на ${channel.name}`);
                document.getElementById('globalSubName').value = '';
            } catch (error) {
                showMessage(error.message, true);
            }
        } else {
            showMessage('Выберите канал и введите имя подписчика', true);
        }
    });
    
    document.getElementById('deleteChannelBtn').addEventListener('click', async () => {
        const channelId = document.getElementById('deleteChannelSelect').value;
        if (channelId) {
            try {
                await asyncRemoveChannel(parseInt(channelId));
                updateUI();
                showMessage('Канал удалён');
            } catch (error) {
                showMessage(error.message, true);
            }
        } else {
            showMessage('Выберите канал для удаления', true);
        }
    });
}

init();