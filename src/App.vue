<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-content">
        <i class="ph ph-users-three header-icon"></i>
        <h1>Gestión de Usuarios</h1>
      </div>
      <p class="subtitle">Administra los usuarios de tu plataforma de forma sencilla.</p>
    </header>

    <main class="app-main">
      <!-- Formulario -->
      <section class="card form-card">
        <div class="card-header">
          <i :class="editando ? 'ph ph-pencil-simple' : 'ph ph-user-plus'" class="card-icon"></i>
          <h2>{{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
        </div>
        <form @submit.prevent="guardar" class="modern-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre y Apellido</label>
              <div class="input-wrapper">
                <i class="ph ph-user input-icon"></i>
                <input v-model="form.nombre" placeholder="Ej. Juan Pérez" required />
              </div>
            </div>
            
            <div class="form-group">
              <label>Correo Electrónico</label>
              <div class="input-wrapper">
                <i class="ph ph-envelope-simple input-icon"></i>
                <input v-model="form.email" placeholder="correo@ejemplo.com" type="email" required />
              </div>
            </div>

            <div class="form-group">
              <label>Teléfono (Opcional)</label>
              <div class="input-wrapper">
                <i class="ph ph-phone input-icon"></i>
                <input v-model="form.telefono" placeholder="+51 999 999 999" />
              </div>
            </div>

            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <div class="input-wrapper">
                <i class="ph ph-calendar-blank input-icon"></i>
                <input v-model="form.fecha_nacimiento" type="date" />
              </div>
            </div>

            <div class="form-group">
              <label>Edad</label>
              <div class="input-wrapper">
                <i class="ph ph-hash input-icon"></i>
                <input v-model.number="form.edad" placeholder="0" type="number" min="0" max="120" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" v-if="editando" @click="cancelar">
              <i class="ph ph-x"></i> Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="ph ph-check" v-if="!editando"></i>
              <i class="ph ph-floppy-disk" v-else></i>
              {{ editando ? 'Actualizar Usuario' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Tabla -->
      <section class="card table-card">
        <div class="card-header table-header">
          <div class="title-group">
            <i class="ph ph-table card-icon"></i>
            <h2>Directorio de Usuarios</h2>
          </div>
          <div class="table-badge">{{ usuarios.length }} usuarios</div>
        </div>

        <div class="state-container" v-if="loading">
          <i class="ph ph-spinner-gap spinner"></i>
          <p>Cargando información...</p>
        </div>
        
        <div class="state-container error-state" v-else-if="error">
          <i class="ph ph-warning-circle"></i>
          <p>{{ error }}</p>
          <button class="btn btn-outline" @click="cargar">Reintentar</button>
        </div>

        <div class="table-wrap" v-else-if="usuarios.length">
          <table class="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Fecha Nac.</th>
                <th>Edad</th>
                <th class="align-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u.id" class="table-row">
                <td class="col-id">#{{ u.id }}</td>
                <td class="col-user">
                  <div class="user-info">
                    <div class="avatar">{{ u.nombre.charAt(0).toUpperCase() }}</div>
                    <span class="fw-medium">{{ u.nombre }}</span>
                  </div>
                </td>
                <td class="col-contact">
                  <div class="contact-line"><i class="ph ph-envelope-simple text-muted"></i> {{ u.email }}</div>
                  <div class="contact-line" v-if="u.telefono"><i class="ph ph-phone text-muted"></i> {{ u.telefono }}</div>
                </td>
                <td>{{ formatFecha(u.fecha_nacimiento) }}</td>
                <td>
                  <span class="badge" v-if="u.edad">{{ u.edad }} años</span>
                  <span class="text-muted" v-else>-</span>
                </td>
                <td class="col-actions align-right">
                  <button class="icon-btn edit-btn" @click="editar(u)" title="Editar">
                    <i class="ph ph-pencil-simple"></i>
                  </button>
                  <button class="icon-btn delete-btn" @click="eliminar(u.id)" title="Eliminar">
                    <i class="ph ph-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="state-container empty-state" v-else>
          <div class="empty-icon-wrap">
            <i class="ph ph-users"></i>
          </div>
          <h3>No hay usuarios</h3>
          <p>Aún no has registrado ningún usuario en la plataforma.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './services/api'

const usuarios = ref([])
const loading  = ref(false)
const error    = ref('')
const editando = ref(false)
const form     = ref({
  id: null,
  nombre: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  edad: ''
})

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-PE')
}

async function cargar() {
  loading.value = true
  error.value = ''
  try {
    const res = await getUsuarios()
    usuarios.value = res.data
  } catch (e) {
    error.value = 'Error al cargar usuarios'
  } finally {
    loading.value = false
  }
}

async function guardar() {
  try {
    if (editando.value) {
      await updateUsuario(form.value.id, form.value)
    } else {
      await createUsuario(form.value)
    }
    cancelar()
    await cargar()
  } catch (e) {
    error.value = 'Error al guardar usuario'
  }
}

function editar(u) {
  editando.value = true
  form.value = {
    ...u,
    fecha_nacimiento: u.fecha_nacimiento ? u.fecha_nacimiento.split('T')[0] : ''
  }
}

function cancelar() {
  editando.value = false
  form.value = { id: null, nombre: '', email: '', telefono: '', fecha_nacimiento: '', edad: '' }
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este usuario?')) return
  try {
    await deleteUsuario(id)
    await cargar()
  } catch (e) {
    error.value = 'Error al eliminar usuario'
  }
}

onMounted(cargar)
</script>

<style>
:root {
  /* Colors */
  --c-primary: #4f46e5;
  --c-primary-hover: #4338ca;
  --c-primary-light: #eef2ff;
  --c-surface: #ffffff;
  --c-background: #f8fafc;
  
  --c-text-main: #0f172a;
  --c-text-muted: #64748b;
  --c-border: #e2e8f0;
  --c-border-focus: #94a3b8;
  
  --c-danger: #ef4444;
  --c-danger-hover: #dc2626;
  --c-danger-light: #fef2f2;
  
  --c-warning: #f59e0b;
  --c-warning-light: #fffbeb;
  
  /* Layout */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--c-background);
  color: var(--c-text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.app-layout {
  max-width: 1024px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Typography & Utilities */
.text-muted { color: var(--c-text-muted); }
.fw-medium { font-weight: 500; }
.align-right { text-align: right; }

/* Header */
.app-header {
  margin-bottom: 1rem;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.header-icon {
  font-size: 2rem;
  color: var(--c-primary);
  background: var(--c-primary-light);
  padding: 0.5rem;
  border-radius: var(--radius-md);
}
.app-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--c-text-main);
}
.subtitle {
  color: var(--c-text-muted);
  font-size: 1.125rem;
}

/* Cards */
.card {
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--c-border);
  overflow: hidden;
  transition: transform var(--transition), box-shadow var(--transition);
}
.card:hover {
  box-shadow: var(--shadow-md);
}
.card-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid transparent;
}
.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}
.card-icon {
  font-size: 1.5rem;
  color: var(--c-primary);
}

/* Forms */
.modern-form {
  padding: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-text-main);
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--c-text-muted);
  font-size: 1.25rem;
  pointer-events: none;
}
.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  color: var(--c-text-main);
  background: var(--c-surface);
  transition: all var(--transition);
  outline: none;
  font-family: inherit;
}
.input-wrapper input:hover {
  border-color: var(--c-border-focus);
}
.input-wrapper input:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-light);
}
.input-wrapper input::placeholder {
  color: #cbd5e1;
}

/* Buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--c-border);
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
  font-family: inherit;
}
.btn:active { transform: scale(0.98); }

.btn-primary {
  background: var(--c-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}
.btn-primary:hover {
  background: var(--c-primary-hover);
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  background: white;
  color: var(--c-text-main);
  border-color: var(--c-border);
}
.btn-secondary:hover {
  background: var(--c-background);
  color: var(--c-text-main);
}

.btn-outline {
  background: transparent;
  color: var(--c-primary);
  border-color: var(--c-primary);
}
.btn-outline:hover {
  background: var(--c-primary-light);
}

/* Table Area */
.table-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--c-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.table-badge {
  background: var(--c-primary-light);
  color: var(--c-primary);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}
.modern-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}
.modern-table th {
  background: #f8fafc;
  color: var(--c-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--c-border);
}
.modern-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
  vertical-align: middle;
}
.table-row {
  transition: background-color var(--transition);
}
.table-row:hover {
  background-color: #f8fafc;
}

/* User Column formatting */
.col-id {
  color: var(--c-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.avatar {
  background: var(--c-primary-light);
  color: var(--c-primary);
  font-weight: 600;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.contact-line {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--c-text-main);
  margin-bottom: 0.2rem;
}

.badge {
  background: #f1f5f9;
  color: var(--c-text-main);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
}

/* Icon Buttons in Table */
.col-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--c-text-muted);
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
}
.icon-btn.edit-btn:hover {
  background: var(--c-warning-light);
  color: var(--c-warning);
}
.icon-btn.delete-btn:hover {
  background: var(--c-danger-light);
  color: var(--c-danger);
}

/* States (Loading, Error, Empty) */
.state-container {
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
  color: var(--c-text-muted);
}
.spinner {
  font-size: 2.5rem;
  color: var(--c-primary);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  background: var(--c-background);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--c-text-muted);
  margin-bottom: 0.5rem;
}
.empty-state h3 {
  color: var(--c-text-main);
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.error-state {
  background: var(--c-danger-light);
  color: var(--c-danger);
  border-radius: var(--radius-lg);
  margin: 1.5rem;
  padding: 2.5rem;
}
.error-state i {
  font-size: 2.5rem;
}
.error-state .btn-outline {
  border-color: var(--c-danger);
  color: var(--c-danger);
  margin-top: 0.5rem;
}
.error-state .btn-outline:hover {
  background: #fecaca;
}

/* Responsive */
@media (max-width: 640px) {
  .app-layout { padding: 1rem; }
  .form-actions { flex-direction: column-reverse; }
  .btn { width: 100%; justify-content: center; }
  .form-grid { grid-template-columns: 1fr; }
  .table-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>