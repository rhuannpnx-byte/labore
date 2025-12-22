# 🎨 Guia Visual - Labore Forms

## Como Testar as Novas Funcionalidades

### 🌓 Modo Escuro

#### Ativar/Desativar
1. Acesse qualquer página do sistema (exceto login)
2. Procure o ícone de **lua** (🌙) ou **sol** (☀️) no header
3. Clique para alternar entre os temas
4. O tema será salvo automaticamente

#### Desktop
- Botão fica no header principal, ao lado do menu de usuário

#### Mobile
- Botão fica no canto superior direito, ao lado do menu hambúrguer

---

## 📱 Menu Mobile

### Como Acessar
1. Em telas pequenas (< 768px)
2. Clique no ícone **☰** (menu hambúrguer) no canto superior direito
3. O menu se expande verticalmente
4. Clique novamente ou clique fora para fechar

### Itens do Menu Mobile
- Link para Dashboard
- Pendentes (se houver)
- Seletor de obra
- Configurações da conta
- Sair

---

## 🏠 Nova Dashboard

### Seção de Boas-vindas
- **Saudação personalizada** baseada no horário
  - Manhã (até 12h): "Bom dia"
  - Tarde (12h-18h): "Boa tarde"
  - Noite (após 18h): "Boa noite"
- **Nome do usuário** extraído do perfil
- **Obra ativa** exibida

### Cards de Acesso Rápido
- **Hover**: Passa o mouse sobre os cards para ver o efeito
  - Scale up (aumenta levemente)
  - Sombra mais pronunciada
  - Seta aparece

### Alertas
- **Obra não selecionada**: Aparece se você não tiver uma obra ativa
- **Offline**: Aviso visual quando sem conexão

---

## 🎨 Componentes Visuais

### Botões

#### Variantes Disponíveis
```jsx
// Azul - Ação principal
<Button variant="primary">Salvar</Button>

// Cinza - Ação secundária
<Button variant="secondary">Cancelar</Button>

// Vermelho - Ação destrutiva
<Button variant="danger">Excluir</Button>

// Verde - Ação positiva
<Button variant="success">Confirmar</Button>

// Amarelo - Aviso
<Button variant="warning">Atenção</Button>

// Transparente
<Button variant="ghost">Link</Button>

// Com borda
<Button variant="outline">Outline</Button>
```

#### Tamanhos
```jsx
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>
```

#### Estados
```jsx
<Button isLoading>Carregando...</Button>
<Button disabled>Desabilitado</Button>
```

### Cards

#### Básico
```jsx
<Card>
  <CardContent>Conteúdo</CardContent>
</Card>
```

#### Com Header e Footer
```jsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo principal</CardContent>
  <CardFooter>Rodapé com ações</CardFooter>
</Card>
```

#### Com Hover
```jsx
<Card hover>
  <CardContent>Card com efeito hover</CardContent>
</Card>
```

### Badges

#### Variantes
```jsx
<Badge variant="primary">Primário</Badge>
<Badge variant="success">Sucesso</Badge>
<Badge variant="warning">Aviso</Badge>
<Badge variant="danger">Erro</Badge>
```

#### Com Dot (indicador)
```jsx
<Badge variant="success" dot>Ativo</Badge>
<Badge variant="warning" dot>Pendente</Badge>
```

### Inputs

#### Básico
```jsx
<Input
  label="Nome"
  placeholder="Digite seu nome"
/>
```

#### Com Ícone
```jsx
<Input
  label="Email"
  type="email"
  icon={<Mail />}
  iconPosition="left"
/>
```

#### Com Helper Text
```jsx
<Input
  label="Senha"
  type="password"
  helperText="Mínimo de 8 caracteres"
/>
```

#### Com Erro
```jsx
<Input
  label="Email"
  error="Email inválido"
/>
```

---

## 📐 Layout Padrão de Páginas

### Estrutura Recomendada
```jsx
import { PageLayout } from '../components/ui/PageLayout';

export default function MinhaPage() {
  return (
    <PageLayout
      title="Título da Página"
      subtitle="Descrição opcional da página"
      showBackButton={true}
      backTo="/dashboard"
      headerAction={
        <Button variant="primary">
          Nova Ação
        </Button>
      }
    >
      {/* Seu conteúdo aqui */}
      <div className="space-y-6">
        <Card>...</Card>
        <Card>...</Card>
      </div>
    </PageLayout>
  );
}
```

---

## 🎯 Responsividade

### Breakpoints

#### Mobile (< 768px)
- 1 coluna
- Menu hambúrguer
- Stack vertical
- Font sizes menores

#### Tablet (768px - 1024px)
- 2 colunas
- Menu horizontal
- Layout misto

#### Desktop (> 1024px)
- 3 colunas
- Todos os controles visíveis
- Layout completo

### Teste de Responsividade

1. **Chrome DevTools**
   - F12 → Toggle Device Toolbar (Ctrl+Shift+M)
   - Selecione diferentes dispositivos
   - Teste interações touch

2. **Tamanhos Comuns**
   - iPhone SE: 375x667
   - iPhone 12: 390x844
   - iPad: 768x1024
   - Desktop: 1920x1080

---

## 🎨 Cores do Sistema

### Light Mode
- **Background**: Cinza muito claro (#f9fafb)
- **Cards**: Branco (#ffffff)
- **Texto**: Quase preto (#0f172a)
- **Primária**: Azul (#0ea5e9)

### Dark Mode
- **Background**: Cinza muito escuro (#0f172a)
- **Cards**: Cinza escuro (#1e293b)
- **Texto**: Quase branco (#f8fafc)
- **Primária**: Azul mais claro (#38bdf8)

### Cores Semânticas
- **Sucesso**: Verde (#22c55e)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)
- **Info**: Azul (#3b82f6)

---

## ✨ Animações

### Hover Effects
- **Cards**: Scale 1.05 + sombra
- **Botões**: Mudança de cor suave
- **Links**: Underline animado

### Transições
- **Tema**: 200ms ease
- **Hover**: 200ms ease
- **Modal**: 300ms ease
- **Menu**: 200ms ease

### Loading
- **Spinner**: Rotação infinita
- **Skeleton**: Pulse animado
- **Shimmer**: Gradiente deslizante

---

## 🔍 Dicas de Uso

### Performance
- Transições usam `transform` (GPU accelerated)
- Imagens otimizadas
- Lazy loading quando possível

### Acessibilidade
- Contraste adequado em ambos os temas
- Focus visible em todos os elementos
- Navegação por teclado funcional
- ARIA labels onde necessário

### Boas Práticas
- Use `PageLayout` para consistência
- Prefira componentes UI do sistema
- Mantenha espaçamento consistente (múltiplos de 4px)
- Cores semânticas para ações

---

## 🐛 Solução de Problemas

### Tema não muda
1. Verifique se está logado
2. Limpe o cache do navegador
3. Verifique o localStorage

### Layout quebrado mobile
1. Force refresh (Ctrl+F5)
2. Teste sem extensões do navegador
3. Verifique o console por erros

### Animações lentas
1. Desative animações do sistema
2. Verifique performance do dispositivo
3. Feche outras abas pesadas

---

## 📱 Testes Recomendados

### Checklist Básico
- [ ] Login em dark mode
- [ ] Dashboard responsivo
- [ ] Menu mobile funcionando
- [ ] Toggle de tema
- [ ] Formulários com validação
- [ ] Modais abrindo/fechando
- [ ] Cards com hover
- [ ] Transições suaves

### Dispositivos
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Mac
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Tablet

---

## 🎓 Tutoriais

### Como Criar uma Nova Página
1. Crie o arquivo em `src/pages/NomeDaPagina.tsx`
2. Use `PageLayout` como wrapper
3. Adicione seus componentes UI
4. Teste responsividade
5. Teste em ambos os temas

### Como Adicionar um Card
1. Importe `Card` e subcomponentes
2. Use a estrutura padrão (Header, Content, Footer)
3. Adicione hover se interativo
4. Teste em mobile

### Como Estilizar Texto
- Use classes Tailwind
- Prefira `text-gray-900 dark:text-gray-100`
- Para títulos: `text-2xl font-bold`
- Para subtítulos: `text-sm text-gray-600 dark:text-gray-400`

---

**Criado em**: Dezembro 2024  
**Versão**: 1.0  
**Mantenedor**: Equipe de Desenvolvimento


