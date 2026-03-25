<template>
  <div class="container">
    <h1>CRUD Usuarios</h1>

    <!-- Formulario -->
    <div class="card">
      <h2>{{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
      <form @submit.prevent="guardar">
        <input v-model="form.nombre"           placeholder="Nombre"            required />
        <input v-model="form.email"            placeholder="Email"             type="email" required />
        <input v-model="form.telefono"         placeholder="Teléfono" />
        <input v-model="form.fecha_nacimiento" placeholder="Fecha de nacimiento" type="date" />
        <input v-model.number="form.edad"      placeholder="Edad"              type="number" min="0" max="120" />
        <div class="btn-group">
          <button type="submit" class="btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          <button v-if="editando" type="button" class="btn-secondary" @click="cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Tabla -->
    <div class="card">
      <h2>Lista de Usuarios</h2>
      <p v-if="loading">Cargando...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="table-wrap" v-if="usuarios.length">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Fecha Nac.</th>
              <th>Edad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id">
              <td>{{ u.id }}</td>
              <td>{{ u.nombre }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.telefono || '-' }}</td>
              <td>{{ formatFecha(u.fecha_nacimiento) }}</td>
              <td>{{ u.edad ?? '-' }}</td>
              <td>
                <button class="btn-edit"   @click="editar(u)">Editar</button>
                <button class="btn-delete" @click="eliminar(u.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="!loading">No hay usuarios registrados.</p>
    </div>
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
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: sans-serif; background: #f0f2f5; padding: 20px; }
.container { max-width: 1000px; margin: auto; }
h1 { margin-bottom: 20px; color: #2d3748; }
.card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
h2 { margin-bottom: 14px; font-size: 1.1rem; color: #4a5568; }
form { display: flex; flex-wrap: wrap; gap: 10px; }
input { flex: 1; min-width: 160px; padding: 8px 12px; border: 1px solid #cbd5e0; border-radius: 6px; }
.btn-group { display: flex; gap: 8px; width: 100%; }
button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: .9rem; }
.btn-primary   { background: #4299e1; color: white; }
.btn-secondary { background: #a0aec0; color: white; }
.btn-edit      { background: #ed8936; color: white; margin-right: 6px; }
.btn-delete    { background: #fc8181; color: white; }
.table-wrap    { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: .9rem; }
th { background: #f7fafc; color: #718096; }
.error { color: #e53e3e; }
</style>