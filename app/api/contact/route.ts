import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { firstname, lastname, email, phone, role, message } = await request.json();

    await resend.emails.send({
      from: 'Studio Vision <onboarding@resend.dev>',
      to: process.env.RESEND_TO_EMAIL!,
      subject: `Nouveau message de ${firstname} ${lastname}`,
      html: `
        <h2>Nouveau message depuis Studio Vision</h2>
        <p><strong>Nom :</strong> ${firstname} ${lastname}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone}</p>
        <p><strong>Profil :</strong> ${role}</p>
        <hr/>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
  }
}