<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="messages-container">
      <h1 class="page-title">Comunicación</h1>
      <div class="search-and-results">
        <input
          type="text"
          v-model="searchQuery"
          @input="searchUsers"
          placeholder="Ingrese el nombre del usuario..."
          class="search-input"
        />
        <div v-if="searchResults.length > 0" class="search-results">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="search-result-item"
            @click="selectUser(user)"
          >
            {{ user.nombre }} {{ user.apellido }} ({{ user.rol }})
          </div>
        </div>
      </div>

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
              <label for="searchUser">Buscar Usuario</label>
              <div class="search-user-container">
                <input
                  type="text"
                  id="searchUser"
                  v-model="searchQuery"
                  @input="searchUsers"
                  class="form-input"
                  placeholder="Escriba el nombre del usuario..."
                />
                <div v-if="searchResults.length > 0" class="search-results">
                  <div
                    v-for="user in searchResults"
                    :key="user.id"
                    class="search-result-item"
                    @click="selectUser(user)"
                  >
                    {{ user.nombre }} {{ user.apellido }} ({{ user.rol }})
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedUser" class="selected-user">
              Usuario seleccionado: {{ selectedUser.nombre }} {{ selectedUser.apellido }}
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

    <!-- Notificaciones -->
    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue';
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next';
import { messageService } from '@/services/messageService';
import { useNotifications } from '@/utils/useNotifications.js';

const { showNotification } = useNotifications();

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
const searchQuery = ref('')
const searchResults = ref([])
const selectedUser = ref(null)

const fetchConversations = async () => {
  try {
    const conversationsData = await messageService.getConversations();
    const groupedConversations = conversationsData.reduce((acc, message) => {
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
    const conversationData = await messageService.getConversationMessages(subject);
    selectedConversation.value = conversationData;
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
    if (!selectedUser.value) {
      showNotification('warning', 'Atención', 'Por favor seleccione un usuario para enviar el mensaje');
      return;
    }

    if (!newConversation.value.subject || !newConversation.value.content) {
      showNotification('warning', 'Atención', 'Por favor complete todos los campos requeridos');
      return;
    }

    const payload = {
      recipient_id: selectedUser.value.id,
      recipient_role: selectedUser.value.rol,
      subject: newConversation.value.subject,
      content: newConversation.value.content
    };

    await messageService.sendMessage(payload);
    await fetchConversations();
    showNotification('success', 'Éxito', 'Conversación creada exitosamente');
    closeNewConversationModal();
  } catch (error) {
    console.error('Error creating conversation:', error);
    showNotification('error', 'Error', 'Error al crear la conversación: ' + error.message);
  }
};

const sendMessage = async () => {
  if (!selectedConversation.value || !selectedConversation.value[0]) {
    showNotification('warning', 'Atención', 'No hay una conversación seleccionada');
    return;
  }

  if (!newMessageContent.value.trim()) {
    showNotification('warning', 'Atención', 'Por favor escriba un mensaje');
    return;
  }

  try {
    const currentConversation = selectedConversation.value[0];
    const payload = {
      subject: currentConversation.subject,
      content: newMessageContent.value.trim()
    };

    await messageService.sendConversationMessage(payload);
    await selectConversation(currentConversation.subject);
    newMessageContent.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification('error', 'Error', 'Error al enviar el mensaje: ' + error.message);
  }
};

const searchUsers = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  try {
    const users = await messageService.searchUsers(searchQuery.value);
    searchResults.value = users;
  } catch (error) {
    console.error('Error searching users:', error);
    searchResults.value = [];
  }
}

const selectUser = (user) => {
  if (!user || !user.id || !user.rol) {
    console.error('Invalid user data:', user);
    return;
  }

  selectedUser.value = user
  searchResults.value = []
  searchQuery.value = ''
  newConversation.value = {
    ...newConversation.value,
    userType: user.rol,
    userId: user.id,
    userName: `${user.nombre} ${user.apellido}`
  }
}

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

.search-and-results {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f5f5;
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

.search-user-container {
  position: relative;
  z-index: 1002; /* Ensure it displays above other elements */
}

.selected-user {
  margin: 1rem 0;
  padding: 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
  color: #2e7d32;
}
</style>
