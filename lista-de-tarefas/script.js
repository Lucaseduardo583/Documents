/**
 * TaskFlow - Aplicativo de Lista de Tarefas Moderno e Intuitivo
 * Padrão de Arquitetura Limpo e Modular (ES6+)
 */

class TaskApp {
  constructor() {
    // Chaves de armazenamento local
    this.STORAGE_KEY_TASKS = 'taskflow_tasks';
    this.STORAGE_KEY_THEME = 'taskflow_theme';

    // Estado da Aplicação
    this.tasks = this.loadTasks();
    this.currentFilter = 'all'; // 'all' | 'pending' | 'completed'
    this.searchQuery = '';

    // Cache de Elementos do DOM
    this.dom = {
      taskForm: document.getElementById('taskForm'),
      taskInput: document.getElementById('taskInput'),
      taskPriority: document.getElementById('taskPriority'),
      taskList: document.getElementById('taskList'),
      emptyState: document.getElementById('emptyState'),
      emptyTitle: document.getElementById('emptyTitle'),
      emptySubtitle: document.getElementById('emptySubtitle'),
      currentDate: document.getElementById('currentDate'),
      progressText: document.getElementById('progressText'),
      progressBar: document.getElementById('progressBar'),
      pendingCount: document.getElementById('pendingCount'),
      filterButtons: document.querySelectorAll('.filter-btn'),
      searchInput: document.getElementById('searchInput'),
      clearCompletedBtn: document.getElementById('clearCompletedBtn'),
      themeToggle: document.getElementById('themeToggle'),
      htmlRoot: document.documentElement
    };

    this.init();
  }

  /**
   * Inicialização do sistema e bind de eventos
   */
  init() {
    this.initTheme();
    this.displayDate();
    this.registerEventListeners();
    this.render();
  }

  /**
   * Registra todos os ouvintes de eventos da interface
   */
  registerEventListeners() {
    // Submissão do formulário de nova tarefa
    this.dom.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTask();
    });

    // Filtros de status (Todas, Pendentes, Concluídas)
    this.dom.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.render();
      });
    });

    // Campo de busca em tempo real
    this.dom.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.render();
    });

    // Limpar tarefas concluídas
    this.dom.clearCompletedBtn.addEventListener('click', () => {
      this.clearCompleted();
    });

    // Alternador de tema claro/escuro
    this.dom.themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  /**
   * Formatação e exibição da data atual em português
   */
  displayDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const today = new Date().toLocaleDateString('pt-BR', options);
    // Capitaliza a primeira letra do dia
    this.dom.currentDate.textContent = today.charAt(0).toUpperCase() + today.slice(1);
  }

  /**
   * Gerenciamento de Tema (Claro / Escuro)
   */
  initTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY_THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    this.dom.htmlRoot.setAttribute('data-theme', activeTheme);
  }

  toggleTheme() {
    const currentTheme = this.dom.htmlRoot.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.dom.htmlRoot.setAttribute('data-theme', newTheme);
    localStorage.setItem(this.STORAGE_KEY_THEME, newTheme);
  }

  /**
   * Persistência de Dados (LocalStorage)
   */
  loadTasks() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_TASKS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erro ao ler tarefas do localStorage:', e);
    }

    // Tarefas iniciais de demonstração para a primeira visita
    return [
      {
        id: '1',
        text: 'Bem-vindo ao TaskFlow! Conclua esta tarefa clicando no check.',
        priority: 'alta',
        completed: false,
        createdAt: 'Agora'
      },
      {
        id: '2',
        text: 'Dê um duplo clique no texto de qualquer tarefa para editar.',
        priority: 'normal',
        completed: false,
        createdAt: 'Agora'
      },
      {
        id: '3',
        text: 'Aproveite o modo escuro no botão do cabeçalho ✨',
        priority: 'baixa',
        completed: true,
        createdAt: 'Agora'
      }
    ];
  }

  saveTasks() {
    try {
      localStorage.setItem(this.STORAGE_KEY_TASKS, JSON.stringify(this.tasks));
    } catch (e) {
      console.error('Erro ao gravar tarefas no localStorage:', e);
    }
  }

  /**
   * Adicionar Nova Tarefa
   */
  handleAddTask() {
    const text = this.dom.taskInput.value.trim();
    const priority = this.dom.taskPriority.value;

    if (!text) return;

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTask = {
      id: Date.now().toString(),
      text: text,
      priority: priority,
      completed: false,
      createdAt: timeString
    };

    this.tasks.unshift(newTask);
    this.saveTasks();

    this.dom.taskInput.value = '';
    this.dom.taskInput.focus();
    this.render();
  }

  /**
   * Alternar estado concluído/pendente
   */
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }

  /**
   * Excluir Tarefa com animação suave
   */
  deleteTask(id, element) {
    if (element) {
      element.classList.add('removing');
      element.addEventListener('animationend', () => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
      }, { once: true });
    } else {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.saveTasks();
      this.render();
    }
  }

  /**
   * Edição Inline de Tarefa
   */
  startEditing(id, textContainer) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const currentText = task.text;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentText;

    textContainer.innerHTML = '';
    textContainer.appendChild(input);
    input.focus();
    input.select();

    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText) {
        task.text = newText;
        this.saveTasks();
      }
      this.render();
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        input.removeEventListener('blur', saveEdit);
        this.render();
      }
    });
  }

  /**
   * Limpar tarefas concluídas
   */
  clearCompleted() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    this.tasks = this.tasks.filter(t => !t.completed);
    this.saveTasks();
    this.render();
  }

  /**
   * Filtragem de tarefas de acordo com status e busca
   */
  getFilteredTasks() {
    return this.tasks.filter(task => {
      // Filtro de status
      const matchesFilter =
        this.currentFilter === 'all' ||
        (this.currentFilter === 'pending' && !task.completed) ||
        (this.currentFilter === 'completed' && task.completed);

      // Filtro de busca textual
      const matchesSearch = task.text.toLowerCase().includes(this.searchQuery);

      return matchesFilter && matchesSearch;
    });
  }

  /**
   * Atualização das estatísticas e barra de progresso
   */
  updateProgress() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    this.dom.progressText.textContent = `${percentage}%`;
    this.dom.progressBar.style.width = `${percentage}%`;
    this.dom.pendingCount.textContent = pending;
  }

  /**
   * Renderização principal da interface
   */
  render() {
    const filteredTasks = this.getFilteredTasks();
    this.dom.taskList.innerHTML = '';

    // Gerencia o Empty State
    if (filteredTasks.length === 0) {
      this.dom.emptyState.classList.add('visible');

      if (this.searchQuery) {
        this.dom.emptyTitle.textContent = 'Nenhuma tarefa encontrada';
        this.dom.emptySubtitle.textContent = `Nenhum resultado para "${this.searchQuery}".`;
      } else if (this.currentFilter === 'completed') {
        this.dom.emptyTitle.textContent = 'Sem tarefas concluídas';
        this.dom.emptySubtitle.textContent = 'Marque suas tarefas como finalizadas para vê-las aqui.';
      } else if (this.currentFilter === 'pending') {
        this.dom.emptyTitle.textContent = 'Tudo pronto!';
        this.dom.emptySubtitle.textContent = 'Você não possui nenhuma tarefa pendente no momento.';
      } else {
        this.dom.emptyTitle.textContent = 'Tudo limpo por aqui!';
        this.dom.emptySubtitle.textContent = 'Adicione uma nova tarefa acima para começar seu dia produtivo.';
      }
    } else {
      this.dom.emptyState.classList.remove('visible');
    }

    // Constrói os elementos da lista
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      // Checkbox
      const leftDiv = document.createElement('div');
      leftDiv.className = 'task-left';

      const checkbox = document.createElement('div');
      checkbox.className = 'custom-checkbox';
      checkbox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      checkbox.addEventListener('click', () => this.toggleTask(task.id));

      // Conteúdo (texto + meta info)
      const contentDiv = document.createElement('div');
      contentDiv.className = 'task-content';

      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.textContent = task.text;
      textSpan.title = 'Duplo clique para editar';
      textSpan.addEventListener('dblclick', () => this.startEditing(task.id, contentDiv));

      const metaDiv = document.createElement('div');
      metaDiv.className = 'task-meta';

      const prioritySpan = document.createElement('span');
      prioritySpan.className = `priority-badge priority-${task.priority}`;
      prioritySpan.textContent = task.priority;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'task-time';
      timeSpan.textContent = task.createdAt || '';

      metaDiv.appendChild(prioritySpan);
      if (task.createdAt) metaDiv.appendChild(timeSpan);

      contentDiv.appendChild(textSpan);
      contentDiv.appendChild(metaDiv);

      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(contentDiv);

      // Botões de Ação (Editar e Deletar)
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn edit-btn';
      editBtn.title = 'Editar tarefa';
      editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      `;
      editBtn.addEventListener('click', () => this.startEditing(task.id, contentDiv));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.title = 'Excluir tarefa';
      deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id, li));

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(leftDiv);
      li.appendChild(actionsDiv);
      this.dom.taskList.appendChild(li);
    });

    this.updateProgress();
  }
}

// Inicializa o aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new TaskApp();
});
