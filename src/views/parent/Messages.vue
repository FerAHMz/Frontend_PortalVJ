<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="messages-container">
      <h1 class="page-title">Comunicación</h1>
      
      <!-- Búsqueda de usuarios - responsive -->
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
        <!-- Lista de conversaciones -->
        <div 
          class="conversations-list" 
          :class="{ 'mobile-hidden': selectedConversation && isMobileView }"
        >
          <div class="conversations-header">
            <h2>Conversaciones</h2>
            <button class="add-message-btn" @click="openNewConversationModal">+</button>
          </div>
          
          <div class="conversations-scroll">
            <div
              v-for="(conversation, index) in latestConversations"
              :key="conversation.subject"
              class="conversation-item"
              :class="{ 'alt-background': index % 2 === 1 }"
              @click="selectConversation(conversation.subject)"
            >
              <h3>{{ conversation.subject }}</h3>
              <p class="message-preview">{{ conversation.content }}</p>
              <span class="conversation-date">
                {{ new Date(conversation.created_at).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Conversación seleccionada -->
        <div 
          class="selected-conversation" 
          :class="{ 'mobile-full': selectedConversation && isMobileView }"
          v-if="selectedConversation"
        >
          <!-- Header móvil con botón de regreso -->
          <div class="mobile-conversation-header">
            <button class="back-btn" @click="goBackToConversations">
              ← Volver
            </button>
            <h3 class="conversation-title">{{ getConversationTitle() }}</h3>
          </div>

          <div class="messages-scrollable">
            <div v-if="selectedConversation.length === 0" class="no-messages">
              <p>No hay mensajes en esta conversación</p>
            </div>
            <div
              v-else
              v-for="(message, index) in selectedConversation"
              :key="message.created_at"
              class="message-item"
              :class="{
                'alt-background': index % 2 === 1,
                'sent': message.sender_id === currentUserId.value
              }"
            >
              <div class="message-header">
                <span class="sender">
                  {{ message.sender_id === currentUserId.value ? 'Tú' : 
                    (message.sender_nombre ? `${message.sender_nombre} ${message.sender_apellido}` : message.sender_role) }}
                </span>
                <span class="date">{{ new Date(message.created_at).toLocaleString() }}</span>
              </div>
              <p class="message-content">{{ message.content }}</p>
            </div>
          </div>

          <!-- Input para responder -->
          <div class="new-message">
            <input
              type="text"
              class="message-input"
              v-model="newMessageContent"
              @keyup.enter="sendReply"
              placeholder="Escribe tu mensaje..."
            />
            <button class="send-message-btn" @click="sendReply">Enviar</button>
          </div>
        </div>

        <!-- Placeholder cuando no hay conversación seleccionada -->
        <div 
          class="no-conversation-selected" 
          v-if="!selectedConversation && !isMobileView"
        >
          <p>Selecciona una conversación para ver los mensajes</p>
        </div>
      </div>

      <!-- Modal de nueva conversación -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue';
import { User, BookOpen, CalendarDays, FileText, MessageSquare, CreditCard } from 'lucide-vue-next';
import { messageService } from '@/services/messageService';
import { useNotifications } from '@/utils/useNotifications.js';
import { useRouter } from 'vue-router';

const currentUserId = ref(null);
const currentUserRole = ref('');
const router = useRouter();
const isMobileView = ref(false);

const { showNotification } = useNotifications();

const menuItems = [
  { label: 'Perfil', icon: User, path: '/parent' },
  { label: 'Calificaciones', icon: FileText, path: '/parent/grades' },
  { label: 'Tareas', icon: BookOpen, path: '/parent/tasks' },
  { label: 'Pagos', icon: CreditCard, path: '/parent/payments' },
  { label: 'Comunicación', icon: MessageSquare, path: '/parent/messages' },
  { label: 'Calendario', icon: CalendarDays, path: '/parent/calendar' }
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
const searchQuery = ref('');
const searchResults = ref([]);
const selectedUser = ref(null);

// Función para detectar si es vista móvil
const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 768;
};

const fetchConversations = async () => {
  try {
    const conversationsData = await messageService.getConversations();
    const groupedConversations = conversationsData.reduce((acc, message) => {
      acc[message.subject] = message; // Mantener solo el mensaje más reciente para cada asunto
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
    if (!conversationData || conversationData.length === 0) {
      showNotification('info', 'Información', 'No se encontraron mensajes en esta conversación');
      selectedConversation.value = [];
      return;
    }
    selectedConversation.value = conversationData;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    showNotification('error', 'Error', 'Error al cargar la conversación');
    selectedConversation.value = [];
  }
};

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path);
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
  selectedUser.value = null;
  searchQuery.value = '';
  searchResults.value = [];
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

    const storedUserRole = localStorage.getItem('userRole');

    if (!storedUserRole) {
      showNotification('error', 'Error', 'No se pudo verificar su rol de usuario');
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
    showNotification('error', 'Error', error.message || 'Error al crear la conversación');
  }
};

const sendReply = async () => {
  if (!selectedConversation.value || !selectedConversation.value.length || !newMessageContent.value.trim()) {
    return;
  }
  try {
    const currentConversation = selectedConversation.value[0];
    const storedUserRole = localStorage.getItem('userRole');

    if (!storedUserRole) {
      showNotification('error', 'Error', 'No se pudo verificar su rol de usuario');
      return;
    }

    await messageService.sendConversationMessage({
      subject: currentConversation.subject,
      content: newMessageContent.value.trim(),
      sender_role: storedUserRole
    });

    await selectConversation(currentConversation.subject);
    newMessageContent.value = '';
    showNotification('success', 'Éxito', 'Mensaje enviado');
  } catch (error) {
    console.error('Error sending reply:', error);
    showNotification('error', 'Error', error.message || 'Error al enviar el mensaje');
  }
};

const searchUsers = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }
  try {
    const users = await messageService.searchUsers(searchQuery.value);
    searchResults.value = users;  // messageService ya devuelve el array de usuarios
  } catch (error) {
    console.error('Error searching users:', error);
    showNotification('error', 'Error', 'Error al buscar usuarios');
    searchResults.value = [];
  }
};

const selectUser = (user) => {
  selectedUser.value = user;
  searchResults.value = [];
  searchQuery.value = '';
  newConversation.value = {
    ...newConversation.value,
    recipient_id: user.id,
    recipient_role: user.rol,
    userName: `${user.nombre} ${user.apellido}`
  };
};

// Función para volver a la lista de conversaciones en móvil
const goBackToConversations = () => {
  if (isMobileView.value) {
    selectedConversation.value = null;
  }
};

// Función para obtener el título de la conversación
const getConversationTitle = () => {
  if (selectedConversation.value && selectedConversation.value.length > 0) {
    return selectedConversation.value[0].subject;
  }
  return 'Conversación';
};

onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');

    if (!token || !storedUserRole || !storedUserId) {
      router.push('/login');
      return;
    }

    // Verificar que el rol almacenado coincida con el formato esperado
    if (!['Padre', 'Maestro', 'Director', 'Administrativo'].includes(storedUserRole)) {
      showNotification('error', 'Error', 'Rol de usuario inválido');
      router.push('/login');
      return;
    }

    currentUserId.value = storedUserId;
    currentUserRole.value = storedUserRole;

    // Configurar detección de vista móvil
    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    await fetchConversations();
  } catch (error) {
    console.error('Error initializing messages:', error);
    showNotification('error', 'Error', 'Error al cargar los mensajes');
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView);
});
</script>

<style scoped>
/* Layout principal */
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.messages-container {
  flex: 1;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Búsqueda de usuarios */
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

/* Layout de mensajes */
.messages-layout {
  display: flex;
  gap: 20px;
  height: calc(100% - 3rem);
}

/* Lista de conversaciones */
.conversations-list {
  flex: 1;
  max-width: 500px;
  border-right: 2px solid #000;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.conversations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
}

.conversations-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.conversations-scroll {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 15px;
  background-color: #82E6B1;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.conversation-item:hover {
  background-color: #70d9a3;
}

.conversation-item.alt-background {
  background-color: #FFFFFF;
}

.conversation-item.alt-background:hover {
  background-color: #f5f5f5;
}

.conversation-item h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.message-preview {
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
  font-size: 0.9rem;
}

.conversation-date {
  font-size: 0.8rem;
  color: #888;
}

.add-message-btn {
  width: 40px;
  height: 40px;
  background-color: #1b9963;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-message-btn:hover {
  background-color: #158a50;
}

/* Conversación seleccionada */
.selected-conversation {
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.mobile-conversation-header {
  display: none;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #1b9963;
  cursor: pointer;
  padding: 0.5rem;
}

.conversation-title {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.messages-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message-item {
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  max-width: 85%;
}

.message-item.sent {
  background-color: #e3f2fd;
  margin-left: auto;
  margin-right: 0;
}

.message-item:not(.sent) {
  background-color: #f5f5f5;
  margin-right: auto;
  margin-left: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: #666;
}

.sender {
  font-weight: 600;
}

.message-content {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.new-message {
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  resize: none;
}

.send-message-btn {
  padding: 12px 20px;
  background-color: #1b9963;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.send-message-btn:hover {
  background-color: #158a50;
}

/* Placeholder para conversación no seleccionada */
.no-conversation-selected {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
}

.no-messages {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-style: italic;
}

/* Modal */
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
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  box-sizing: border-box;
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
  z-index: 1002;
}

.selected-user {
  margin: 1rem 0;
  padding: 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
  color: #2e7d32;
}

/* Estilos responsive para móvil */
@media screen and (max-width: 768px) {
  .messages-container {
    padding: 80px 15px 15px 15px; /* Espacio para el botón hamburguesa del sidebar */
  }

  .page-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .search-and-results {
    max-width: 100%;
  }

  .messages-layout {
    height: calc(100% - 2rem);
    gap: 0;
    position: relative;
  }

  /* Lista de conversaciones en móvil */
  .conversations-list {
    max-width: none;
    border-right: none;
    border-radius: 8px;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
  }

  .conversations-list.mobile-hidden {
    display: none;
  }

  .conversations-header {
    padding: 0.75rem;
  }

  .conversations-header h2 {
    font-size: 1.1rem;
  }

  .add-message-btn {
    width: 35px;
    height: 35px;
    font-size: 18px;
  }

  .conversation-item {
    padding: 12px;
  }

  .conversation-item h3 {
    font-size: 1rem;
  }

  /* Conversación seleccionada en móvil */
  .selected-conversation.mobile-full {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 20;
    border-radius: 0;
  }

  .mobile-conversation-header {
    display: flex;
  }

  .message-item {
    margin: 8px 0;
    padding: 12px;
    max-width: 90%;
  }

  .message-header {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }

  .new-message {
    padding: 12px;
    gap: 8px;
  }

  .message-input {
    padding: 10px;
    font-size: 16px; 
  }

  .send-message-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  /* Modal responsive */
  .modal-content {
    padding: 1.5rem;
    margin: 10px;
    max-height: 85vh;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .modal-btn {
    width: 100%;
    padding: 1rem;
  }
}

/* Tablets */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .conversations-list {
    max-width: 350px;
  }

  .message-item {
    max-width: 80%;
  }

  .modal-content {
    max-width: 600px;
  }
}

/* Pantallas muy pequeñas */
@media screen and (max-width: 480px) {
  .messages-container {
    padding: 80px 10px 10px 10px;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .conversation-item {
    padding: 10px;
  }

  .message-item {
    padding: 10px;
    max-width: 95%;
  }

  .new-message {
    padding: 10px;
    flex-direction: column;
    gap: 10px;
  }

  .send-message-btn {
    width: 100%;
  }
}
</style>