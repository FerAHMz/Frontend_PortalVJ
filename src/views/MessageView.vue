<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="messages-container">
      <h1 class="page-title">Comunicación</h1>
      <div class="messages-layout">
        <!-- Conversations List -->
        <div class="conversations-list">
          <div
            v-for="(conversation, index) in latestConversations"
            :key="conversation.subject"
            class="conversation-item"
            :class="{ 'alt-background': index % 2 === 1 }"
            @click="selectConversation(conversation.subject)"
          >
            <h3>{{ conversation.subject }}</h3>
            <p class="message-preview">{{ conversation.content }}</p>
          </div>
          <button class="add-message-btn" @click="openNewConversationModal">+</button>
        </div>

        <!-- Selected Conversation -->
        <div class="selected-conversation" v-if="selectedConversation">
          <div class="messages-scrollable">
            <div
              v-for="(message, index) in selectedConversation"
              :key="message.created_at"
              class="message-item"
              :class="{ 'alt-background': index % 2 === 1 }"
            >
              <p>{{ message.content }}</p>
              <p><small>{{ new Date(message.created_at).toLocaleString() }}</small></p>
            </div>
          </div>
          <div class="new-message">
            <textarea
              v-model="newMessageContent"
              placeholder="Escribe un mensaje..."
              class="message-input"
            ></textarea>
            <button @click="sendMessage" class="send-message-btn">Enviar</button>
          </div>
        </div>
      </div>

      <!-- New Conversation Modal -->
      <div v-if="showNewConversationModal" class="modal-overlay">
        <div class="modal-content">
          <h2>Nueva Conversación</h2>
          <form @submit.prevent="createNewConversation">
            <div class="form-group">
              <label for="userType">Tipo de Usuario</label>
              <select
                id="userType"
                v-model="newConversation.userType"
                class="form-input"
                required
              >
                <option value="" disabled>Seleccione un tipo de usuario</option>
                <option value="maestro">Maestro</option>
                <option value="padre">Padre</option>
              </select>
            </div>
            <div class="form-group">
              <label for="userId">ID del Usuario</label>
              <input
                type="text"
                id="userId"
                v-model="newConversation.userId"
                class="form-input"
                placeholder="Ingrese el ID del usuario"
              />
            </div>
            <div class="form-group">
              <label for="userName">Nombre del Usuario</label>
              <input
                type="text"
                id="userName"
                v-model="newConversation.userName"
                class="form-input"
                placeholder="Ingrese el nombre del usuario"
              />
            </div>
            <div class="form-group">
              <label for="subject">Asunto</label>
              <input
                type="text"
                id="subject"
                v-model="newConversation.subject"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="content">Contenido</label>
              <textarea
                id="content"
                v-model="newConversation.content"
                class="form-input"
                required
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn cancel" @click="closeNewConversationModal">
                Cancelar
              </button>
              <button type="submit" class="modal-btn save">Crear</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next';

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' },
];

const conversations = ref([]);
const selectedConversation = ref(null);
const showNewConversationModal = ref(false);
const newConversation = ref({
  userType: '',
  userId: '',
  userName: '',
  subject: '',
  content: '',
});
const newMessageContent = ref('');

const getAuthToken = () => {
  return localStorage.getItem('token'); // Ensure the token is stored in localStorage after login
};

const fetchConversations = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get('http://localhost:3000/api/messages', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const groupedConversations = response.data.conversations.reduce((acc, message) => {
      acc[message.subject] = message; // Keep only the latest message for each subject
      return acc;
    }, {});
    conversations.value = Object.values(groupedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
  }
};

const selectConversation = async (subject) => {
  try {
    const token = getAuthToken();
    const response = await axios.get('http://localhost:3000/api/messages/conversation', {
      headers: { Authorization: `Bearer ${token}` },
      params: { subject },
    });
    selectedConversation.value = response.data.conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
  }
};

const handleItemClick = (item) => {
  if (item.path) {
    window.location.href = item.path;
  }
};

const latestConversations = computed(() => {
  return conversations.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const openNewConversationModal = () => {
  showNewConversationModal.value = true;
};

const closeNewConversationModal = () => {
  showNewConversationModal.value = false;
  newConversation.value = { userType: '', userId: '', userName: '', subject: '', content: '' };
};

const createNewConversation = async () => {
  try {
    const token = getAuthToken();
    const payload = {
      userType: newConversation.value.userType,
      userId: newConversation.value.userId,
      userName: newConversation.value.userName,
      subject: newConversation.value.subject,
      content: newConversation.value.content,
    };

    const response = await axios.post('http://localhost:3000/api/messages', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Conversación creada exitosamente');
    closeNewConversationModal();
    fetchConversations();
  } catch (error) {
    console.error('Error creating conversation:', error);
    alert('Error al crear la conversación');
  }
};

const sendMessage = async () => {
  if (!newMessageContent.value.trim()) return;

  try {
    const token = getAuthToken();
    const payload = {
      subject: selectedConversation.value[0].subject,
      content: newMessageContent.value,
    };

    const response = await axios.post('http://localhost:3000/api/messages/conversation', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Mensaje enviado exitosamente');
    selectedConversation.value.push({
      content: newMessageContent.value,
      created_at: new Date().toISOString(),
    });
    newMessageContent.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error al enviar el mensaje');
  }
};

onMounted(() => {
  fetchConversations();
});
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.messages-container {
  flex: 1;
  padding: 20px;
  position: relative;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.messages-layout {
  display: flex;
  gap: 20px;
  height: calc(100% - 3rem);
}

.conversations-list {
  flex: 1;
  max-width: 500px;
  border-right: 2px solid #000;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.conversation-item {
  padding: 10px;
  background-color: #82E6B1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.8rem;
}

.conversation-item.alt-background {
  background-color: #FFFFFF;
}

.message-preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-message-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #1b9963;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
}

.add-message-btn:hover {
  background-color: #158a50;
}

.selected-conversation {
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.messages-scrollable {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px;
}

.message-item {
  padding: 10px;
  border-radius: 8px;
  background-color: #82E6B1;
  font-size: 1.2rem;
  margin-bottom: 70px;
}

.message-item.alt-background {
  background-color: #FFFFFF;
}

.new-message {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
  position: relative;
}

.message-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

.send-message-btn {
  padding: 10px 20px;
  background-color: #1b9963;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.send-message-btn:hover {
  background-color: #158a50;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}

.modal-btn.save {
  background-color: #1b9963;
  color: white;
  border: none;
}
</style>
