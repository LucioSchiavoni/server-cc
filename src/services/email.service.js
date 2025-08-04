// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendNewOrderNotification = async (
  order, 
  clubEmail
) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Falta la API key de Resend en las variables de entorno');
    }

    if (!clubEmail) {
      throw new Error('El email del club es requerido');
    }

    const total = order.items.reduce((sum, item) => 
      sum + (item.quantity * item.product.price), 0
    ).toFixed(2);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif;">
        <h1> Nueva orden de ${order.user.name}</h1>
        <p><strong>Orden #${order.id}</strong> - ${new Date(order.createdAt).toLocaleString('es-ES')}</p>
        <p><strong>Email:</strong> ${order.user.email}</p>
        <p><strong>Estado:</strong> ${order.status}</p>

        <h3>Productos:</h3>
        <ul>
          ${order.items.map((item) => `
            <li>
              ${item.product.name} - ${item.quantity}g × €${item.product.price} = 
              <strong>€${(item.quantity * item.product.price).toFixed(2)}</strong>
            </li>
          `).join('')}
        </ul>

        <h2>Total: €${total}</h2>

        <p>⚠️ Esta orden está pendiente de revisión y procesamiento.</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Ordenes <onboarding@resend.dev>', 
      to: [clubEmail],
      subject: `Nueva Orden #${order.id} - ${order.user.name}`,
      html: htmlContent,
    });

    if (error) {

      return {
        success: false,
        error: 'Error al enviar email con Resend.',
        details: error.message,
      };
    }
    return { success: true, messageId: data.id };

  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendOrderCancelledNotification = async (
  order,
  clubEmail
) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Falta la API key de Resend en las variables de entorno');
    }

    if (!clubEmail) {
      throw new Error('El email del club es requerido');
    }

    const total = order.items.reduce((sum, item) =>
      sum + (item.quantity * item.product.price), 0
    ).toFixed(2);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif;">
        <h1>Cancelación de orden por ${order.user.name}</h1>
        <p><strong>Orden #${order.id}</strong> - ${new Date(order.updatedAt || order.cancelledAt || new Date()).toLocaleString('es-ES')}</p>
        <p><strong>Email:</strong> ${order.user.email}</p>
        <p><strong>Estado:</strong> ${order.status}</p>

        <h3>Productos:</h3>
        <ul>
          ${order.items.map((item) => `
            <li>
              ${item.product.name} - ${item.quantity}g × €${item.product.price} = 
              <strong>€${(item.quantity * item.product.price).toFixed(2)}</strong>
            </li>
          `).join('')}
        </ul>

        <h2>Total: €${total}</h2>

        <p>❌ El socio ha cancelado esta orden.</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Ordenes <onboarding@resend.dev>',
      to: [clubEmail],
      subject: `Orden Cancelada #${order.id} - ${order.user.name}`,
      html: htmlContent,
    });

    if (error) {
      return {
        success: false,
        error: 'Error al enviar email de cancelación con Resend.',
        details: error.message,
      };
    }
    return { success: true, messageId: data.id };

  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
