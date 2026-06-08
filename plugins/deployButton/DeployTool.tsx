import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
} from '@sanity/ui';
import { RocketIcon } from '@sanity/icons';

type DeployState = 'idle' | 'deploying' | 'success' | 'error';

// Studio is typically hosted on *.sanity.studio while the trigger-deploy
// Netlify function lives on the production site (different origin), so the
// URL must be absolute. Falls back to a relative path for local-only studio
// dev where studio and frontend may share an origin.
const FUNCTION_URL =
  (process.env.SANITY_STUDIO_DEPLOY_FUNCTION_URL as string | undefined) ||
  '/.netlify/functions/trigger-deploy';

const SECRET =
  (process.env.SANITY_STUDIO_DEPLOY_HOOK_SECRET as string | undefined) || '';

const LAST_DEPLOY_KEY = 'last_deploy';

export function DeployTool() {
  const [state, setState] = useState<DeployState>('idle');
  const [message, setMessage] = useState('');
  const [lastDeploy, setLastDeploy] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(LAST_DEPLOY_KEY)
  );

  async function handleDeploy() {
    if (state === 'deploying') return;

    const confirmed = window.confirm(
      'This will rebuild and publish the live site. Are you sure all your changes are ready?'
    );
    if (!confirmed) return;

    setState('deploying');
    setMessage('');

    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'x-deploy-secret': SECRET },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}) as { error?: string });
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { timestamp?: string };
      const timestamp = data.timestamp ?? new Date().toISOString();

      window.localStorage.setItem(LAST_DEPLOY_KEY, timestamp);
      setLastDeploy(timestamp);
      setState('success');
      setMessage('Deploy triggered successfully. The site will update in 1–3 minutes.');

      setTimeout(() => setState('idle'), 8000);
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  const formattedLastDeploy = lastDeploy
    ? new Date(lastDeploy).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  const tips = [
    'After updating site-wide info (hours, address, contact details)',
    'After adding or editing people, programs, or events',
    'After any content changes you want live now',
    'You can batch multiple changes before deploying — no need to deploy after each one',
  ];

  return (
    <Box padding={4}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={2}>Deploy Site</Heading>
          <Text size={1} muted>
            Make all your CMS changes first, then click the button below to publish
            everything to the live site in one build.
          </Text>
        </Stack>

        {formattedLastDeploy && (
          <Card padding={3} radius={2} tone="transparent" border>
            <Text size={1} muted>
              Last triggered from this browser: <strong>{formattedLastDeploy}</strong>
            </Text>
          </Card>
        )}

        <Flex gap={3} align="center">
          <Button
            icon={state === 'deploying' ? Spinner : RocketIcon}
            text={state === 'deploying' ? 'Triggering deploy…' : 'Deploy Site Now'}
            tone={state === 'error' ? 'critical' : 'primary'}
            disabled={state === 'deploying'}
            onClick={handleDeploy}
            fontSize={2}
            padding={4}
          />

          {state === 'success' && <Badge tone="positive">Triggered</Badge>}
          {state === 'error' && <Badge tone="critical">Error</Badge>}
        </Flex>

        {message && (
          <Card
            padding={3}
            radius={2}
            border
            tone={state === 'error' ? 'critical' : 'positive'}
          >
            <Text size={1}>{message}</Text>
          </Card>
        )}

        <Card padding={4} radius={2} tone="caution" border>
          <Stack space={3}>
            <Text size={1} weight="semibold">
              When to use this button
            </Text>
            <Stack space={2}>
              {tips.map((tip) => (
                <Text key={tip} size={1} muted>
                  • {tip}
                </Text>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
