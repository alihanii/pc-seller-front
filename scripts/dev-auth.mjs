// Dev-only helper for the page scripts: a JWT for the demo customer, minted by the local Django.
// The backend refuses unless DEBUG is on.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const BACKEND = resolve(process.env.BACKEND_DIR ?? '../backend')

export function demoTokens() {
  const python = existsSync(`${BACKEND}/.venv/bin/python`) ? `${BACKEND}/.venv/bin/python` : 'python3'
  const code = `
import json
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User
from orders.models import Order
assert settings.DEBUG, 'tokens are only minted in DEBUG mode'
user, _ = User.objects.get_or_create(mobile='09120000101', defaults={'first_name': 'سارا'})
refresh = RefreshToken.for_user(user)
order = Order.objects.filter(user=user).order_by('-created_at').first()
print(json.dumps({'access': str(refresh.access_token), 'refresh': str(refresh), 'order': order.number if order else None}))
`
  const out = execFileSync(python, ['manage.py', 'shell', '-c', code], { cwd: BACKEND, encoding: 'utf8' })
  return JSON.parse(out.trim().split('\n').pop())
}
