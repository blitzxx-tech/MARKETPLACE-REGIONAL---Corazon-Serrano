// Marketplace Regional - Sierra Gorda Queretana Backend API Server

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const DATA_FILE = path.join(__dirname, 'database.json');

const initialData = {
  municipios: [
    { id: 1, nombre: "Jalpan de Serra", lat: 21.2167, lng: -99.4667, desc: "Corazón histórico de la Sierra Gorda y patrimonio de misiones barrocas." },
    { id: 2, nombre: "Landa de Matamoros", lat: 21.1833, lng: -99.3167, desc: "Tierra de profundas tradiciones artesanas, bosques y misiones." },
    { id: 3, nombre: "Arroyo Seco", lat: 21.5500, lng: -99.6833, desc: "Región de ríos cristalinos, huertos y licores artesanales." },
    { id: 4, nombre: "Pinal de Amoles", lat: 21.1333, lng: -99.6333, desc: "Montañas de niebla, ecoturismo y artesanías de madera y cantera." }
  ],
  categorias: [
    { id: "artesanias", nombre: "Artesanías y Cerámica", icono: "🎨" },
    { id: "alimentos", nombre: "Miel y Alimentos Orgánicos", icono: "🍯" },
    { id: "textiles", nombre: "Textiles y Bordados", icono: "🧵" },
    { id: "ecoturismo", nombre: "Cabañas y Ecoturismo", icono: "🏕️" },
    { id: "licores", nombre: "Licores y Dulces Tradicionales", icono: "🍾" },
    { id: "madera", nombre: "Madera y Lapidaria", icono: "🪵" },
    { id: "cesteria", nombre: "Fibras Vegetales y Cestería", icono: "🌾" }
  ],
  productores: [
    {
      id: 1,
      usuario_id: 1001,
      nombre_taller: "Taller Cerámico Pame Xi'úi",
      artesano: "María Luisa Hernández",
      municipio: "Jalpan de Serra",
      comunidad: "Tancoyol",
      categoria_principal: "Alfarería y Cerámica",
      clabe: "012345678901234567",
      titular_cuenta: "María Luisa Hernández",
      lat: 21.2167,
      lng: -99.4667,
      historia: "Preservamos la alfarería Pame con barro nativo pulido a mano desde hace 3 generaciones en Tancoyol, Jalpan.",
      contacto: "4411023948"
    },
    {
      id: 2,
      usuario_id: 1002,
      nombre_taller: "Apícola Melipona Serrana",
      artesano: "Don José Trinidad Pérez",
      municipio: "Landa de Matamoros",
      comunidad: "Agua Zarca",
      categoria_principal: "Miel y Alimentos Orgánicos",
      clabe: "012345678901234568",
      titular_cuenta: "José Trinidad Pérez",
      lat: 21.1833,
      lng: -99.3167,
      historia: "Cuidamos abejas meliponas nativas sin aguijón en los bosques de Landa para producir miel medicinal pura.",
      contacto: "4411058291"
    },
    {
      id: 3,
      usuario_id: 1003,
      nombre_taller: "Licores y Conservas Tradicionales Concá",
      artesano: "Doña Tomasa Ríos",
      municipio: "Arroyo Seco",
      comunidad: "Concá",
      categoria_principal: "Licores y Dulces Tradicionales",
      clabe: "012345678901234569",
      titular_cuenta: "Tomasa Ríos",
      lat: 21.5500,
      lng: -99.6833,
      historia: "Elaboración de licores de frutas de la región del río Concá y dulces tradicionales con recetas heredadas.",
      contacto: "4411092384"
    },
    {
      id: 4,
      usuario_id: 1004,
      nombre_taller: "Ecoturismo y Cabañas Cuatro Palos",
      artesano: "Comunidad Cuatro Palos",
      municipio: "Pinal de Amoles",
      comunidad: "Cuatro Palos",
      categoria_principal: "Cabañas y Ecoturismo",
      clabe: "012345678901234570",
      titular_cuenta: "Comunidad Cuatro Palos",
      lat: 21.1333,
      lng: -99.6333,
      historia: "Cabañas de hospedaje ecológico al borde del mirador de Cuatro Palos a más de 2,700 msnm.",
      contacto: "4411123490"
    }
  ],
  usuarios: [
    {
      id: 1001,
      nombre: "María Luisa Hernández",
      email: "maria@sierragorda.mx",
      telefono: "4411023948",
      password: "123",
      rol: "vendedor",
      municipio: "Jalpan de Serra",
      comunidad: "Tancoyol",
      nombre_taller: "Taller Cerámico Pame Xi'úi",
      clabe: "012345678901234567"
    },
    {
      id: 1002,
      nombre: "Ana María Gómez",
      email: "comprador@ejemplo.com",
      telefono: "4429876543",
      password: "123",
      rol: "comprador",
      municipio: "Jalpan de Serra"
    }
  ],
  productos: [
    {
      id: 101,
      nombre: "Vasija de Barro Pame Xi'úi Grabada a Mano",
      categoria: "artesanias",
      municipio: "Jalpan de Serra",
      comunidad: "Tancoyol",
      productor_id: 1,
      artesano: "María Luisa Hernández",
      precio: 450,
      stock: 8,
      calificacion: 4.9,
      tiempo_elaboracion: "18 horas de modelado y pulido manual",
      materiales: "Barro rojo nativo de Tancoyol y pigmentos naturales",
      tecnica: "Alfarería tradicional Pame moldeada y alisada con piedra",
      imagen: "/assets/artesania_pame_1786110469232.jpg",
      descripcion: "Vasija artesanal elaborada por familias Pame en Tancoyol, Jalpan. Cada pieza es moldeada individualmente sin moldes industriales.",
      resenas: [
        { cliente: "Carlos M.", estrellas: 5, comentario: "Pieza hermosa de colección. Llegó perfectamente empacada.", fecha: "2026-08-01" }
      ]
    },
    {
      id: 102,
      nombre: "Miel Medicinal de Abeja Melipona Nativa 250ml",
      categoria: "alimentos",
      municipio: "Landa de Matamoros",
      comunidad: "Agua Zarca",
      productor_id: 2,
      artesano: "Don José Trinidad Pérez",
      precio: 380,
      stock: 15,
      calificacion: 5.0,
      tiempo_elaboracion: "Cosecha sustentable de 6 meses",
      materiales: "Néctar silvestre de flores nativas de la Reserva de la Biosfera",
      tecnica: "Extracción artesanal en frascos esterilizados",
      imagen: "/assets/miel_melipona_sierra_1786241438484.jpg",
      descripcion: "Miel medicinal pura de abejas meliponas cosechada en las selvas medianas de Landa de Matamoros. Rica en antioxidantes y propiedades curativas.",
      resenas: [
        { cliente: "Dra. Carmen V.", estrellas: 5, comentario: "Miel auténtica medicinal de melipona. Exquisito sabor aromático a flor de la sierra.", fecha: "2026-07-28" }
      ]
    },
    {
      id: 103,
      nombre: "Dulce Tradicional de Biznaga y Camote de Concá 300g",
      categoria: "licores",
      municipio: "Arroyo Seco",
      comunidad: "Concá",
      productor_id: 3,
      artesano: "Doña Tomasa Ríos",
      precio: 150,
      stock: 12,
      calificacion: 4.85,
      tiempo_elaboracion: "6 horas de cocción lenta en cazo de cobre",
      materiales: "Camote criollo, piloncillo serrano y canela",
      tecnica: "Receta ancestral de la subcuenca del río Concá",
      imagen: "/assets/textil_sierra_gorda_1786241476097.jpg",
      descripcion: "Dulce artesanal típico de la región del río Concá preparado con recetas familiares transmitidas por generaciones.",
      resenas: [
        { cliente: "Lucía P.", estrellas: 5, comentario: "Delicioso sabor tradicional de Concá. Me recordó mis viajes a Arroyo Seco.", fecha: "2026-08-02" }
      ]
    },
    {
      id: 104,
      nombre: "Noche de Cabaña Ecológica Mirador Cuatro Palos",
      categoria: "ecoturismo",
      municipio: "Pinal de Amoles",
      comunidad: "Cuatro Palos",
      productor_id: 4,
      artesano: "Comunidad Cuatro Palos",
      precio: 1200,
      stock: 3,
      calificacion: 4.95,
      tiempo_elaboracion: "Servicio de hospedaje ecoturístico",
      materiales: "Cabaña de piedra y madera sustentable de pino",
      tecnica: "Gestión turística comunitaria sustentable",
      imagen: "/assets/cabana_ecoturismo_1786241513712.jpg",
      descripcion: "Hospedaje ecológico para 2 a 4 personas en el Mirador de Cuatro Palos a 2,700 msnm. Incluye fogata y recorrido guiado al amanecer sobre el mar de niebla.",
      resenas: [
        { cliente: "Roberto S.", estrellas: 5, comentario: "La vista del amanecer en el mar de nubes es inolvidable. ¡Atención impecable de la comunidad!", fecha: "2026-08-04" }
      ]
    },
    {
      id: 105,
      nombre: "Licor Artesanal de Manzana Serrana 750ml",
      categoria: "licores",
      municipio: "Pinal de Amoles",
      comunidad: "Pinal Cabecera",
      productor_id: 4,
      artesano: "Productores de Pinal",
      precio: 220,
      stock: 20,
      calificacion: 4.7,
      tiempo_elaboracion: "4 meses de maceración en barrica",
      materiales: "Manzana serrana criolla de huertos de niebla",
      tecnica: "Destilación tradicional de los bosques fríos de Pinal",
      imagen: "/assets/sierra_gorda_hero_1786110455958.jpg",
      descripcion: "Licor artesanal fermentado naturalmente con manzanas cosechadas en los huertos de niebla de Pinal de Amoles.",
      resenas: []
    }
  ],
  pedidos: [
    {
      id: 'ORD-749102',
      cliente: 'Ana María Gómez',
      email: 'comprador@ejemplo.com',
      telefono: '4429876543',
      items: [
        { id: 101, nombre: "Vasija de Barro Pame Xi'úi Grabada a Mano", precio: 450, cantidad: 1, artesano: "María Luisa Hernández", productor_id: 1 }
      ],
      subtotal: 450,
      costo_envio: 120,
      total: 570,
      metodo_envio: 'Envío Estándar Paquetexpress / DHL ($120.00 MXN)',
      metodo_pago: 'Mercado Pago Sandbox',
      estado: 'En Preparación en Taller',
      fecha: '2026-08-08T14:30:00.000Z'
    }
  ]
};

function getDb() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
  let db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  if (!db.usuarios) db.usuarios = initialData.usuarios;
  if (!db.pedidos) db.pedidos = initialData.pedidos;
  return db;
}

function saveDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// REST API Endpoints

// Metadatos
app.get('/api/municipios', (req, res) => res.json(getDb().municipios));
app.get('/api/categorias', (req, res) => res.json(getDb().categorias));
app.get('/api/productores', (req, res) => res.json(getDb().productores));

// Productos con Filtros (4 Municipios) y Ordenamiento
app.get('/api/productos', (req, res) => {
  const db = getDb();
  const { municipio, categoria, busqueda, orden } = req.query;
  let result = db.productos || [];

  if (municipio && municipio !== 'todos') {
    result = result.filter(p => p.municipio.toLowerCase() === municipio.toLowerCase());
  }

  if (categoria && categoria !== 'todas') {
    result = result.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
  }

  if (busqueda) {
    const q = busqueda.toLowerCase();
    result = result.filter(p => 
      p.nombre.toLowerCase().includes(q) || 
      p.artesano.toLowerCase().includes(q) || 
      p.descripcion.toLowerCase().includes(q)
    );
  }

  if (orden === 'precio_asc') {
    result.sort((a, b) => a.precio - b.precio);
  } else if (orden === 'precio_desc') {
    result.sort((a, b) => b.precio - a.precio);
  } else if (orden === 'rating') {
    result.sort((a, b) => (b.calificacion || 5) - (a.calificacion || 5));
  }

  res.json(result);
});

// Detalle de Producto por ID
app.get('/api/productos/:id', (req, res) => {
  const db = getDb();
  const prod = db.productos.find(p => p.id === parseInt(req.params.id));
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(prod);
});

// Enviar Reseña a Producto
app.post('/api/productos/:id/resenas', (req, res) => {
  const db = getDb();
  const prod = db.productos.find(p => p.id === parseInt(req.params.id));
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

  const { cliente, estrellas, comentario } = req.body;
  if (!prod.resenas) prod.resenas = [];

  const nuevaResena = {
    cliente: cliente || 'Comprador Anónimo',
    estrellas: parseInt(estrellas) || 5,
    comentario: comentario || '',
    fecha: new Date().toISOString().split('T')[0]
  };

  prod.resenas.unshift(nuevaResena);

  const totalEstrellas = prod.resenas.reduce((sum, r) => sum + r.estrellas, 0);
  prod.calificacion = parseFloat((totalEstrellas / prod.resenas.length).toFixed(2));

  saveDb(db);
  res.json({ success: true, producto: prod });
});

// Rastreo Público de Pedido por ID
app.get('/api/pedidos/rastreo/:id', (req, res) => {
  const db = getDb();
  const orderId = (req.params.id || '').toUpperCase().trim();
  const order = db.pedidos.find(p => p.id === orderId);

  if (!order) {
    return res.status(404).json({ success: false, error: `No se encontró ningún pedido con la clave (${orderId}). Verifique el número de ticket.` });
  }

  res.json({ success: true, pedido: order });
});

// Autenticación: Registro
app.post('/api/auth/register', (req, res) => {
  const db = getDb();
  const { 
    nombre, email, telefono, password, rol, 
    municipio, comunidad, nombre_taller, categoria_principal, 
    direccion_recoleccion, clabe, titular_cuenta, historia 
  } = req.body;

  if (!nombre || !email || !telefono || !password) {
    return res.status(400).json({ success: false, error: 'Por favor llena todos los campos obligatorios.' });
  }

  const existingEmail = db.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ success: false, error: 'El correo electrónico ya está registrado.' });
  }

  const existingPhone = db.usuarios.find(u => u.telefono === telefono);
  if (existingPhone) {
    return res.status(400).json({ success: false, error: 'El número de teléfono ya está asociado a otra cuenta.' });
  }

  const newUser = {
    id: Date.now(),
    nombre,
    email: email.toLowerCase(),
    telefono,
    password,
    rol: rol || 'comprador',
    municipio: municipio || 'Jalpan de Serra',
    comunidad: comunidad || null,
    nombre_taller: rol === 'vendedor' ? (nombre_taller || `Taller Artesanal de ${nombre}`) : null,
    categoria_principal: rol === 'vendedor' ? (categoria_principal || 'Alfarería y Cerámica') : null,
    clabe: rol === 'vendedor' ? (clabe || null) : null,
    titular_cuenta: rol === 'vendedor' ? (titular_cuenta || nombre) : null,
    direccion_recoleccion: rol === 'vendedor' ? (direccion_recoleccion || null) : null
  };

  db.usuarios.push(newUser);

  if (newUser.rol === 'vendedor') {
    const muniObj = db.municipios.find(m => m.nombre.toLowerCase() === newUser.municipio.toLowerCase()) || db.municipios[0];
    const newProductor = {
      id: Date.now() + 1,
      usuario_id: newUser.id,
      nombre_taller: newUser.nombre_taller,
      artesano: newUser.nombre,
      municipio: newUser.municipio,
      comunidad: newUser.comunidad || 'Cabecera Municipal',
      categoria_principal: newUser.categoria_principal,
      clabe: newUser.clabe,
      titular_cuenta: newUser.titular_cuenta,
      direccion_recoleccion: newUser.direccion_recoleccion,
      lat: muniObj.lat + (Math.random() * 0.02 - 0.01),
      lng: muniObj.lng + (Math.random() * 0.02 - 0.01),
      historia: historia || `Taller artesanal representativo de ${newUser.municipio} dedicado a la calidad y tradición de la Sierra Gorda.`,
      contacto: telefono || email
    };
    db.productores.push(newProductor);
  }

  saveDb(db);

  res.status(201).json({
    success: true,
    user: {
      id: newUser.id,
      nombre: newUser.nombre,
      email: newUser.email,
      telefono: newUser.telefono,
      rol: newUser.rol,
      municipio: newUser.municipio,
      comunidad: newUser.comunidad,
      nombre_taller: newUser.nombre_taller,
      categoria_principal: newUser.categoria_principal,
      clabe: newUser.clabe
    },
    token: `token_${newUser.id}_${Date.now()}`
  });
});

// Autenticación: Login
app.post('/api/auth/login', (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  const q = (email || '').toLowerCase().trim();

  const user = db.usuarios.find(u => 
    (u.email.toLowerCase() === q || (u.telefono && u.telefono === q)) && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, error: 'Correo/Teléfono o contraseña incorrectos.' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      municipio: user.municipio,
      comunidad: user.comunidad,
      nombre_taller: user.nombre_taller,
      categoria_principal: user.categoria_principal,
      clabe: user.clabe,
      titular_cuenta: user.titular_cuenta
    },
    token: `token_${user.id}_${Date.now()}`
  });
});

// Panel de Vendedor
app.get('/api/vendedor/dashboard', (req, res) => {
  const db = getDb();
  const { usuario_id } = req.query;

  const user = db.usuarios.find(u => u.id === parseInt(usuario_id));
  if (!user || user.rol !== 'vendedor') {
    return res.status(403).json({ success: false, error: 'Acceso no autorizado al panel de vendedor.' });
  }

  const misProductos = db.productos.filter(p => p.productor_id === user.id || p.artesano === user.nombre);
  const misPedidos = db.pedidos.filter(p => 
    p.items && p.items.some(item => item.artesano === user.nombre || item.productor_id === user.id)
  );

  const saldoAcumulado = misPedidos.reduce((total, ped) => {
    const sub = ped.items.reduce((s, i) => (i.artesano === user.nombre || i.productor_id === user.id) ? s + (i.precio * i.cantidad) : s, 0);
    return total + sub;
  }, 0);

  res.json({
    success: true,
    vendedor: {
      nombre: user.nombre,
      nombre_taller: user.nombre_taller || `Taller de ${user.nombre}`,
      municipio: user.municipio,
      clabe: user.clabe || 'No registrada',
      titular_cuenta: user.titular_cuenta || user.nombre,
      saldo_acumulado: saldoAcumulado,
      total_ventas: misPedidos.length
    },
    productos: misProductos,
    pedidos: misPedidos
  });
});

// Actualizar Estado de Pedido por Vendedor
app.post('/api/vendedor/pedidos/estado', (req, res) => {
  const db = getDb();
  const { pedido_id, nuevo_estado } = req.body;

  const pedido = db.pedidos.find(p => p.id === pedido_id);
  if (!pedido) {
    return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
  }

  pedido.estado = nuevo_estado;
  saveDb(db);

  res.json({ success: true, message: `El estado del pedido #${pedido_id} fue actualizado a: "${nuevo_estado}".` });
});

// Alta de Nuevos Productos
app.post('/api/productos', (req, res) => {
  const db = getDb();
  const { nombre, municipio, comunidad, categoria, precio, stock, artesano, tiempo_elaboracion, materiales, descripcion, imagen } = req.body;

  if (!nombre || !municipio || !precio || !artesano) {
    return res.status(400).json({ success: false, error: 'Campos requeridos faltantes.' });
  }

  const newProd = {
    id: Date.now(),
    nombre,
    municipio,
    comunidad: comunidad || 'Cabecera',
    categoria,
    precio: parseFloat(precio),
    stock: parseInt(stock) || 5,
    artesano,
    tiempo_elaboracion: tiempo_elaboracion || 'Elaboración artesanal a mano',
    materiales: materiales || 'Materiales nativos de la Sierra Gorda',
    tecnica: 'Tradición local preservada',
    descripcion,
    imagen: imagen || '/assets/artesania_pame_1786110469232.jpg',
    calificacion: 5.0,
    resenas: []
  };

  db.productos.unshift(newProd);
  saveDb(db);

  res.status(201).json({ success: true, producto: newProd });
});

// Servir la aplicación Frontend SPA (Wildcard Express 5)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`✨ Servidor Marketplace Sierra Gorda Completo en:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
