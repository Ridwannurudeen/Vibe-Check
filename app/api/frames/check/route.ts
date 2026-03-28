import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibecheck.base.org';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Farcaster frame POST body contains:
    // - untrustedData.inputText: the text the user entered
    // - untrustedData.buttonIndex: which button was clicked
    const inputText = body?.untrustedData?.inputText?.trim() || '';

    if (!inputText) {
      return new NextResponse(
        generateFrameHtml({
          imageUrl: `${BASE_URL}/api/og?address=&score=0&tier=Enter%20an%20address`,
          postUrl: `${BASE_URL}/api/frames/check`,
          buttons: [
            { label: 'Try Again', action: 'post' },
          ],
          inputText: 'Enter wallet address or ENS...',
        }),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Fetch reputation from our API
    let score = 1200;
    let tier = 'Neutral';
    let address = inputText;

    try {
      const res = await fetch(`${BASE_URL}/api/v1/reputation/${encodeURIComponent(inputText)}`, {
        headers: { 'x-api-key': process.env.VIBE_CHECK_MASTER_API_KEY || '' },
      });

      if (res.ok) {
        const data = await res.json();
        score = data.ethosData?.score || 1200;
        tier = data.aiAnalysis?.oneWordSummary || 'Neutral';
        address = data.address || inputText;
      }
    } catch {
      // Use defaults on error
    }

    return new NextResponse(
      generateFrameHtml({
        imageUrl: `${BASE_URL}/api/og?address=${encodeURIComponent(address)}&score=${score}&tier=${encodeURIComponent(tier)}`,
        postUrl: `${BASE_URL}/api/frames/check`,
        buttons: [
          { label: 'View Full Report', action: 'link', target: `${BASE_URL}/?address=${encodeURIComponent(address)}` },
          { label: 'Check Another', action: 'post' },
        ],
        inputText: 'Enter wallet address or ENS...',
      }),
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}

interface FrameButton {
  label: string;
  action: 'post' | 'link';
  target?: string;
}

interface FrameHtmlOptions {
  imageUrl: string;
  postUrl: string;
  buttons: FrameButton[];
  inputText?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateFrameHtml({ imageUrl, postUrl, buttons, inputText }: FrameHtmlOptions): string {
  let meta = `
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${escapeHtml(imageUrl)}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:post_url" content="${escapeHtml(postUrl)}" />
  `;

  if (inputText) {
    meta += `<meta property="fc:frame:input:text" content="${escapeHtml(inputText)}" />`;
  }

  buttons.forEach((btn, i) => {
    const idx = i + 1;
    meta += `<meta property="fc:frame:button:${idx}" content="${escapeHtml(btn.label)}" />`;
    meta += `<meta property="fc:frame:button:${idx}:action" content="${escapeHtml(btn.action)}" />`;
    if (btn.target) {
      meta += `<meta property="fc:frame:button:${idx}:target" content="${escapeHtml(btn.target)}" />`;
    }
  });

  return `<!DOCTYPE html><html><head>${meta}<title>Vibe Check</title></head><body></body></html>`;
}
