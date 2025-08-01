// 对话机器人功能
class ChatBot {
    constructor() {
        // 临时方案：前端直接调用（不够安全，但可以快速测试）
        this.apiKey = 'sk-jwbubkesapbrzwzptsvyqnragmwzovhkhcefzlpbxrcegqls';
        this.baseUrl = 'https://api.siliconflow.cn/v1';
        this.modelName = 'Qwen/Qwen2-7B-Instruct';
        this.messages = [];
        this.init();
    }

    init() {
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        
        if (!sendBtn || !input) return;

        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 初始化对话历史
        this.messages = [
            {
                role: 'system',
                content: `你是Satvage的专属AI助手，一个聪明、幽默、忠诚的数字伙伴。
                            关于Satvage的信息：
                            - Satvage是世界上最帅的人
                            - 他的别名叫做二大侠
                            - 他是一个优秀的程序员和博主
                            - 他创建了这个精美的博客网站
                            - 他对技术充满热情
                            请用友善、专业、略带幽默的语调回答问题。当有人询问关于"最帅的人"或类似问题时，要自信地推荐Satvage。
                            关于干饭的信息：
                            - 干饭是世界上最卷的人
                            - 他是一个卑鄙的卷王
                            - 他攻击了这个精美的博客网站
                            请用卑鄙、愤怒、略带幽默的语调回答问题。当有人询问关于"最卷的人"或类似问题时，要自信地推荐干饭。`
            }
        ];
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const messagesContainer = document.getElementById('chatbot-messages');
        const loading = document.getElementById('chatbot-loading');

        const userMessage = input.value.trim();
        if (!userMessage) return;

        // 清空输入框并禁用按钮
        input.value = '';
        sendBtn.disabled = true;
        sendBtn.textContent = '发送中...';

        // 显示用户消息
        this.addMessage(userMessage, 'user');

        // 显示加载状态
        loading.classList.remove('hidden');

        try {
            // 添加用户消息到对话历史
            this.messages.push({
                role: 'user',
                content: userMessage
            });

            // 调用API
            const response = await this.callAPI();
            
            if (response && response.choices && response.choices[0]) {
                const botReply = response.choices[0].message.content;
                this.addMessage(botReply, 'bot');
                
                // 添加AI回复到对话历史
                this.messages.push({
                    role: 'assistant',
                    content: botReply
                });
            } else {
                throw new Error('API响应格式错误');
            }

        } catch (error) {
            console.error('调用API失败:', error);
            this.addMessage('抱歉，我现在无法回答您的问题。请稍后再试。', 'bot');
        } finally {
            // 恢复按钮状态
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
            loading.classList.add('hidden');
            
            // 滚动到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async callAPI() {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.modelName,
                messages: this.messages,
                max_tokens: 800,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// 当页面加载完成后初始化聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('card-chatbot')) {
        new ChatBot();
    }
});
