// app/api/health/route.ts
// Health check endpoint that validates AI API connectivity

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    api_configured: boolean;
    api_accessible?: boolean;
    error?: string;
  };
  app: string;
  version: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      api_configured: false,
    },
    app: 'sigblock-parser',
    version: '1.0.0'
  };

  try {
    // Check 1: API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      result.status = 'unhealthy';
      result.checks.api_configured = false;
      result.checks.error = 'ANTHROPIC_API_KEY not configured';

      // Send alert email
      await sendAlert({
        app: 'SigBlock Parser',
        url: 'https://sigblock.jonathonmarsden.com',
        error: 'ANTHROPIC_API_KEY not configured',
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(result, { status: 503 });
    }

    result.checks.api_configured = true;

    // Check 2: Test API connectivity with minimal request
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Make the smallest possible API call to test connectivity
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Cheapest/fastest model
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: 'ok'
      }],
    });

    if (response.content && response.content.length > 0) {
      result.checks.api_accessible = true;
      result.status = 'healthy';
    } else {
      throw new Error('Empty response from API');
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      ...result,
      response_time_ms: duration
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${duration}ms`
      }
    });

  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    const apiError = error as { status?: number; message?: string };

    result.status = 'unhealthy';
    result.checks.api_accessible = false;

    // Determine error type
    let errorMessage = err.message;

    if (apiError.message?.includes('API key')) {
      errorMessage = 'Invalid API key';
    } else if (apiError.status === 429) {
      errorMessage = 'API rate limit exceeded';
    } else if (apiError.status === 529 || apiError.status === 503) {
      errorMessage = 'API temporarily overloaded';
    } else if (apiError.message?.includes('quota') || apiError.message?.includes('balance')) {
      errorMessage = 'API quota or balance issue';
    }

    result.checks.error = errorMessage;

    // Send alert email for critical errors (not temporary overloads)
    if (apiError.status !== 529 && apiError.status !== 503) {
      await sendAlert({
        app: 'SigBlock Parser',
        url: 'https://sigblock.jonathonmarsden.com',
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: err.message
      });
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      ...result,
      response_time_ms: duration
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${duration}ms`
      }
    });
  }
}

interface AlertPayload {
  app: string;
  url: string;
  error: string;
  timestamp: string;
  details?: string;
}

async function sendAlert(payload: AlertPayload): Promise<void> {
  try {
    // Check if email alert endpoint is configured
    if (!process.env.ALERT_EMAIL_ENDPOINT) {
      console.error('ALERT_EMAIL_ENDPOINT not configured - alert not sent:', payload);
      return;
    }

    // Send alert to configured endpoint
    const response = await fetch(process.env.ALERT_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to send alert:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error sending alert:', error);
  }
}
