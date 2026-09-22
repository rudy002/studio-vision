import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { allow, clientIp } from '../../../lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

// Les champs du formulaire sont insérés dans le HTML de l'email : on les échappe
// pour qu'un visiteur ne puisse pas injecter de balises ou de liens.
/** Réduit une valeur à une seule ligne (sujet d'email). */
const oneLine = (value: unknown) => String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, 120).trim();

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function POST(request: NextRequest) {
  try {
    if (!(await allow('contact', clientIp(request.headers), 3, '1 h'))) {
      return NextResponse.json(
        { error: 'Trop de messages envoyés. Réessayez dans un moment.' },
        { status: 429 },
      );
    }

    const { firstname, lastname, email, phone, role, message } = await request.json();

    await resend.emails.send({
      from: 'Studio Vision <onboarding@resend.dev>',
      to: process.env.RESEND_TO_EMAIL!,
      // Les sauts de ligne dans un sujet d'email servent à injecter des en-têtes.
      subject: `Nouveau message de ${oneLine(firstname)} ${oneLine(lastname)}`,
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