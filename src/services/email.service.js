import nodemailer from 'nodemailer';

// Función para detectar el servicio de email basado en el dominio
const detectEmailService = (email) => {
  const domain = email.toLowerCase().split('@')[1];
  
  switch (domain) {
    case 'gmail.com':
      return 'gmail';
    case 'outlook.com':
    case 'hotmail.com':
    case 'live.com':
    case 'msn.com':
      return 'outlook';
    default:
      return 'smtp'; // Para otros proveedores, usar SMTP genérico
  }
};

// Configuración del transportador de email dinámico
const createTransporter = (userEmail, userPassword) => {
  const emailService = detectEmailService(userEmail);
  
  switch (emailService) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: userEmail,
          pass: userPassword
        }
      });
    
    case 'outlook':
      return nodemailer.createTransport({
        service: 'hotmail', // nodemailer reconoce 'hotmail' para todos los servicios de Microsoft
        auth: {
          user: userEmail,
          pass: userPassword
        }
      });
    
    default:
      // Para otros proveedores, intentar con configuración SMTP genérica
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: userEmail,
          pass: userPassword
        }
      });
  }
};

// Función para enviar email de nueva orden
export const sendNewOrderNotification = async (order, clubEmail, clubEmailPassword) => {
  try {
    const transporter = createTransporter(clubEmail, clubEmailPassword);
    
    // Calcular total de la orden
    const total = order.orderDetails.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    ).toFixed(2);
    
    const mailOptions = {
      from: clubEmail, // Email del club como remitente
      to: clubEmail, // Email del club como destinatario (notificación interna)
      subject: `🛒 Nueva Orden #${order.id} - ${order.user.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">📋 Nueva Orden Recibida</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2 style="color: #059669;">Detalles de la Orden</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Número de Orden:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Cliente:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${order.user.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${order.user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(order.createdAt).toLocaleString('es-ES')}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Estado:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                  <span style="background-color: #fbbf24; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${order.status}
                  </span>
                </td>
              </tr>
            </table>
            
            <h3 style="color: #059669;">Productos Ordenados:</h3>
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
              ${order.orderDetails.map(item => `
                <div style="display: flex; justify-content: between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                  <div style="flex: 1;">
                    <strong>${item.productName}</strong><br>
                    <small style="color: #6b7280;">Cantidad: ${item.quantity} × €${item.price}</small>
                  </div>
                  <div style="font-weight: bold; color: #059669;">
                    €${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: right; margin-top: 20px; padding: 15px; background-color: #ecfdf5; border-radius: 8px;">
              <h3 style="margin: 0; color: #059669;">Total: €${total}</h3>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Acción requerida:</strong> Una nueva orden está esperando tu revisión y procesamiento.
              </p>
            </div>
          </div>
          
          <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 12px;">
              Este email fue generado automáticamente por el sistema de órdenes.
            </p>
          </div>
        </div>
      `,
      text: `
        Nueva Orden Recibida - #${order.id}
        
        Cliente: ${order.user.name} (${order.user.email})
        Fecha: ${new Date(order.createdAt).toLocaleString('es-ES')}
        Estado: ${order.status}
        
        Productos:
        ${order.orderDetails.map(item => 
          `• ${item.productName} - Cantidad: ${item.quantity} - Precio: €${item.price} - Subtotal: €${(item.quantity * item.price).toFixed(2)}`
        ).join('\n')}
        
        Total: €${total}
        
        Una nueva orden está esperando tu revisión y procesamiento.
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de nueva orden enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error al enviar email de nueva orden:', error);
    return { success: false, error: error.message };
  }
};

// Función para enviar email de actualización de estado
export const sendOrderStatusUpdate = async (order, oldStatus) => {
  try {
    const transporter = createTransporter();
    
    const statusColors = {
      'pendiente': '#fbbf24',
      'procesando': '#3b82f6',
      'completada': '#10b981',
      'cancelada': '#ef4444'
    };
    
    const statusEmojis = {
      'pendiente': '⏳',
      'procesando': '🔄',
      'completada': '✅',
      'cancelada': '❌'
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email, // Email del cliente
      subject: `${statusEmojis[order.status]} Actualización de tu Orden #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">${statusEmojis[order.status]} Estado de Orden Actualizado</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hola <strong>${order.user.name}</strong>,</p>
            <p>Te informamos que el estado de tu orden ha sido actualizado:</p>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Orden #${order.id}</h3>
              <p>
                Estado anterior: 
                <span style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${oldStatus}
                </span>
              </p>
              <p>
                Estado actual: 
                <span style="background-color: ${statusColors[order.status]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${order.status}
                </span>
              </p>
            </div>
            
            <p>Gracias por tu pedido.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de actualización enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error al enviar email de actualización:', error);
    return { success: false, error: error.message };
  }
};

// Función de prueba para verificar configuración
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
    return { success: true, message: 'Configuración válida' };
  } catch (error) {
    console.error('❌ Error en configuración de email:', error);
    return { success: false, error: error.message };
  }
};