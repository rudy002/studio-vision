import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Les champs du formulaire sont insérés dans le HTML de l'email : on les échappe
// pour qu'un visiteur ne puisse pas injecter de balises ou de liens.
const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function POST(request: NextRequest) {
  try {
    const { firstname, lastname, email, phone, role, message } = await request.json();

    await resend.emails.send({
      from: 'Studio Vision <onboarding@resend.dev>',
      to: process.env.RESEND_TO_EMAIL!,
      subject: `Nouveau message de ${firstname} ${lastname}`,
      html: `
        <h2>Nouveau message depuis Studio Vision</h2>
        <p><strong>Nom :</strong> ${escapeHtml(firstname)} ${escapeHtml(lastname)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>
        <p><strong>Profil :</strong> ${escapeHtml(role)}</p>
        <hr/>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message)}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
  }
}