# MUTAGENÊSES

Sistema e plataforma online de RPG pós-apocalíptico, com foco em fichas digitais, mesa de jogo, comunidades e bestiário.

## Arquitetura atual

- **GitHub Pages:** publicação do frontend.
- **Supabase:** autenticação, PostgreSQL, RLS, compartilhamento e dados por usuário.
- Cada jogador possui seus próprios personagens, itens, Capacidades, ameaças e comunidades.
- Comunidades podem conectar jogadores e personagens sem misturar os dados particulares de cada conta.
- Personagens possuem permissões de privacidade e compartilhamento.

## Primeiro acesso

1. Abra o site publicado pelo GitHub Pages.
2. Crie uma conta com e-mail e senha.
3. Entre na conta para acessar suas fichas.
4. Criações feitas após o login são salvas no Supabase.

## Comunidades

- O dono de uma comunidade recebe um código de entrada.
- Outro jogador pode usar **Entrar em comunidade** para participar.
- Cada jogador mantém sua própria conta e suas próprias fichas.
- Uma ficha pode ser vinculada à comunidade para aparecer como personagem compartilhado.
- O dono da ficha continua sendo a única conta que possui o personagem original.

## Segurança

O frontend usa apenas a **publishable key** do Supabase. Chaves secretas não devem ser colocadas neste repositório.

As tabelas usam Row Level Security (RLS) para separar os dados por usuário e controlar o acesso compartilhado.

## Publicação

O repositório contém um workflow em `.github/workflows/deploy.yml` para publicar automaticamente a branch `main` no GitHub Pages.

No GitHub, a fonte de Pages deve estar definida como **GitHub Actions** em **Settings → Pages**.

## Backend

Projeto Supabase: `MUTAGENÊSES`.

Migrations aplicadas:
- `initial_mutageneses_schema`
- `auth_sharing_and_community_access`
- `shared_link_role_permissions`
- `fix_character_sharing_rls_and_add_community_invites`
- `harden_public_function_grants`
- `fix_character_community_rls_and_image_storage`
- `enable_community_roster_access`

## Estado

A base online está pronta para o primeiro acesso: contas, dados separados por usuário, comunidades, códigos de entrada, personagens compartilhados e criações autorais já possuem estrutura no Supabase. O frontend principal está no repositório e usa a publishable key do projeto.
