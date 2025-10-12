import { NextRequest, NextResponse } from 'next/server';
import Anthropic from 'anthropic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    const prompt = `Extract contact information from this signature block and return a JSON object.

Include these standard fields if found:
- name (full name)
- firstName (given name)
- lastName (family name)
- email (email address)
- phone (work phone)
- mobile (mobile phone)
- company (organization/company name)
- title (job title/position)
- department
- streetAddress (street number and name)
- city (suburb/city)
- state (state/province)
- postalCode (postcode/zip)
- country
- website (company website)
- linkedin (LinkedIn profile URL)

Also include an "extraInfo" field as an array of strings for ANY information that doesn't fit the above categories (e.g., pronouns, personal notes, social media handles, nicknames, etc.)

Return ONLY valid JSON with no markdown formatting or explanation.

Signature block:
${text}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    let responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Remove markdown code blocks if present
    if (responseText.startsWith('```')) {
      const lines = responseText.split('\n');
      responseText = lines.slice(1, -1).join('\n');
    }

    const parsedContact = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      contact: parsedContact,
      originalText: text,
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse signature',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
