"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Monitor,
  Printer,
  Wifi,
  KeyRound,
  AppWindow,
  CircleHelp,
  ArrowLeft,
  Paperclip,
  Send,
  CheckCircle2,
  Clock3,
  Users,
  LayoutDashboard,
  LogOut,
  Ticket,
  MessageSquare,
  ShieldCheck,
  Search,
} from "lucide-react";
type Role = "servidor" | "tecnico";
type Status =
  "Aberto" | "Em atendimento" | "Aguardando usuário" | "Resolvido" | "Fechado";
type Msg = {
  id: number;
  author: string;
  text: string;
  internal?: boolean;
  at: string;
};
type T = {
  id: number;
  protocolo: string;
  title: string;
  category: string;
  setor: string;
  description: string;
  status: Status;
  priority: string;
  assignee: string;
  created: string;
  messages: Msg[];
  attachment?: string;
  resolution?: string;
};
const cats = [
  { n: "Computador", i: Monitor },
  { n: "Impressora", i: Printer },
  { n: "Internet e rede", i: Wifi },
  { n: "Acesso e senha", i: KeyRound },
  { n: "Sistemas", i: AppWindow },
  { n: "Outro problema", i: CircleHelp },
];
const seed: T[] = [
  {
    id: 1052,
    protocolo: "TI-2026-1052",
    title: "Impressora da recepção não imprime",
    category: "Impressora",
    setor: "Secretaria de Administração",
    description: "A impressora aparece como offline desde esta manhã.",
    status: "Em atendimento",
    priority: "Normal",
    assignee: "Mariana Costa",
    created: "Hoje, 09:12",
    messages: [
      {
        id: 1,
        author: "Mariana Costa · TI",
        text: "Olá! Já estamos verificando a conexão da impressora.",
        at: "09:34",
      },
    ],
  },
  {
    id: 1049,
    protocolo: "TI-2026-1049",
    title: "Acesso ao sistema de protocolo",
    category: "Acesso e senha",
    setor: "Secretaria de Administração",
    description: "Meu acesso informa usuário bloqueado.",
    status: "Aguardando usuário",
    priority: "Normal",
    assignee: "Carlos Lima",
    created: "Ontem, 14:20",
    messages: [
      {
        id: 2,
        author: "Carlos Lima · TI",
        text: "Confirme se o erro ocorre também em outro navegador.",
        at: "Ontem, 15:02",
      },
    ],
  },
  {
    id: 1044,
    protocolo: "TI-2026-1044",
    title: "Internet lenta no setor",
    category: "Internet e rede",
    setor: "Secretaria de Educação",
    description: "Toda a sala está com lentidão.",
    status: "Aberto",
    priority: "Alta",
    assignee: "Não atribuído",
    created: "27 out, 11:08",
    messages: [],
  },
  {
    id: 1038,
    protocolo: "TI-2026-1038",
    title: "Atualização do navegador",
    category: "Sistemas",
    setor: "Secretaria de Saúde",
    description: "Navegador incompatível.",
    status: "Resolvido",
    priority: "Baixa",
    assignee: "Mariana Costa",
    created: "25 out, 10:15",
    resolution: "Navegador atualizado e acesso validado.",
    messages: [],
  },
];
const sc: Record<Status, string> = {
  Aberto: "bg-blue-50 text-blue-700",
  "Em atendimento": "bg-amber-50 text-amber-800",
  "Aguardando usuário": "bg-violet-50 text-violet-700",
  Resolvido: "bg-emerald-50 text-emerald-700",
  Fechado: "bg-slate-100 text-slate-600",
};
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export default function App() {
  const [role, setRole] = useState<Role | null>(null),
    [screen, setScreen] = useState("home"),
    [tickets, setTickets] = useState<T[]>(seed),
    [id, setId] = useState(1052),
    [cat, setCat] = useState(""),
    [apiError, setApiError] = useState("");
  useEffect(() => {
    if (apiUrl) {
      fetch(`${apiUrl}/api/v1/tickets`)
        .then((response) => {
          if (!response.ok) throw new Error("API indisponível");
          return response.json();
        })
        .then((data: T[]) => {
          setTickets(data);
          if (data[0]) setId(data[0].id);
        })
        .catch(() =>
          setApiError(
            "A API local não respondeu. Inicie o servidor antes de usar o modo piloto.",
          ),
        );
      return;
    }
    const saved = localStorage.getItem("pmmp-demo");
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (!apiUrl) localStorage.setItem("pmmp-demo", JSON.stringify(tickets));
  }, [tickets]);
  const current = tickets.find((x) => x.id === id);
  const go = (x: number) => {
    setId(x);
    setScreen("detail");
  };
  const createTicket = async (data: Omit<T, "id" | "protocolo">) => {
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/api/v1/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Não foi possível abrir o chamado");
      const ticket: T = await response.json();
      setTickets((items) => [ticket, ...items]);
      setId(ticket.id);
      setScreen("success");
      return;
    }
    const nextId = Math.max(0, ...tickets.map((ticket) => ticket.id)) + 1;
    const ticket: T = {
      ...data,
      id: nextId,
      protocolo: `TI-2026-${nextId}`,
      messages: [
        {
          id: Date.now(),
          author: "João Silva",
          text: data.description,
          at: "Agora",
        },
      ],
    };
    setTickets((items) => [ticket, ...items]);
    setId(nextId);
    setScreen("success");
  };
  const updateTicket = async (patch: Partial<T>) => {
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/api/v1/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("Não foi possível atualizar o chamado");
      const updated: T = await response.json();
      setTickets((items) =>
        items.map((ticket) => (ticket.id === id ? updated : ticket)),
      );
      return;
    }
    setTickets((items) =>
      items.map((ticket) =>
        ticket.id === id ? { ...ticket, ...patch } : ticket,
      ),
    );
  };
  const addMessage = async (text: string, internal: boolean) => {
    const draft = {
      author: role === "tecnico" ? "Mariana Costa · TI" : "João Silva",
      text,
      internal,
    };
    let message: Msg = { ...draft, id: Date.now(), at: "Agora" };
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/api/v1/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!response.ok) throw new Error("Não foi possível enviar a mensagem");
      message = await response.json();
    }
    setTickets((items) =>
      items.map((ticket) =>
        ticket.id === id
          ? { ...ticket, messages: [...ticket.messages, message] }
          : ticket,
      ),
    );
  };
  if (!role)
    return (
      <Login
        onLogin={(r) => {
          setRole(r);
          setScreen(r === "tecnico" ? "dashboard" : "home");
        }}
      />
    );
  return (
    <div className="min-h-screen bg-[#f5f7f9] text-slate-900">
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4">
          <button
            onClick={() => setScreen(role === "tecnico" ? "dashboard" : "home")}
            className="flex items-center gap-3"
          >
            <Brand />
            <span className="text-left">
              <b className="block text-sm">Central de TI</b>
              <small className="text-slate-500">
                Prefeitura de Miguel Pereira
              </small>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 sm:block">
              {apiUrl ? "Piloto conectado" : "Demonstração"}
            </span>
            <span className="hidden text-sm sm:block">
              {role === "tecnico" ? "Mariana Costa · TI" : "João Silva"}
            </span>
            <button
              onClick={() => setRole(null)}
              aria-label="Sair"
              className="p-2"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1400px]">
        {role === "tecnico" && (
          <aside className="hidden min-h-[calc(100vh-64px)] w-60 border-r bg-white p-4 lg:block">
            <Nav screen={screen} set={setScreen} />
            <div className="mt-8 rounded-xl bg-sky-50 p-4 text-xs leading-relaxed text-sky-800">
              <ShieldCheck className="mb-2" />
              <b>{apiUrl ? "Piloto local" : "Ambiente demonstrativo"}</b>
              <br />
              {apiUrl
                ? "Dados persistidos na API local. Não use dados sensíveis."
                : "Dados fictícios salvos somente neste navegador."}
            </div>
          </aside>
        )}
        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-7">
          {apiError && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800"
            >
              {apiError}
            </div>
          )}
          {role === "servidor" && screen === "home" && (
            <Home
              tickets={tickets}
              open={(c) => {
                setCat(c);
                setScreen("new");
              }}
              go={go}
            />
          )}{" "}
          {role === "servidor" && screen === "new" && (
            <New
              cat={cat}
              back={() => setScreen("home")}
              submit={(d) =>
                createTicket({
                  title: d.title,
                  category: d.category,
                  setor: d.setor,
                  description: d.description,
                  status: "Aberto",
                  priority: "Normal",
                  assignee: "Não atribuído",
                  created: "Agora",
                  attachment: d.attachment,
                  messages: [],
                })
              }
            />
          )}{" "}
          {screen === "success" && current && (
            <Success
              t={current}
              view={() => setScreen("detail")}
              home={() => setScreen("home")}
            />
          )}{" "}
          {screen === "detail" && current && (
            <Detail
              t={current}
              role={role}
              back={() => setScreen(role === "tecnico" ? "queue" : "home")}
              update={updateTicket}
              add={addMessage}
            />
          )}{" "}
          {role === "tecnico" && screen === "dashboard" && (
            <Dashboard tickets={tickets} go={go} />
          )}{" "}
          {role === "tecnico" && screen === "queue" && (
            <Queue tickets={tickets} go={go} />
          )}
        </main>
      </div>
      {role === "tecnico" && (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t bg-white p-2 lg:hidden">
          <button
            onClick={() => setScreen("dashboard")}
            className="flex flex-col items-center text-xs"
          >
            <LayoutDashboard />
            Visão geral
          </button>
          <button
            onClick={() => setScreen("queue")}
            className="flex flex-col items-center text-xs"
          >
            <Ticket />
            Fila
          </button>
        </nav>
      )}
    </div>
  );
}
function Brand() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-700 to-cyan-500 font-black text-white">
      MP
    </span>
  );
}
function Login({ onLogin }: { onLogin: (r: Role) => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#dff4f7,transparent_45%),#edf5f7] p-5">
      <div className="w-full max-w-md rounded-3xl border border-white bg-white p-7 shadow-2xl">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-700 to-cyan-500 font-black text-white">
            MP
          </span>
          <div>
            <b>Prefeitura de Miguel Pereira</b>
            <p className="text-sm text-slate-500">Central de Chamados de TI</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold">
          {apiUrl ? "Acesse o piloto local" : "Acesse a demonstração"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Escolha um perfil para conhecer o fluxo completo.
        </p>
        <div className="mt-7 space-y-3">
          <LoginBtn
            icon={Users}
            title="Entrar como servidor"
            text="Abrir e acompanhar meus chamados"
            onClick={() => onLogin("servidor")}
          />
          <LoginBtn
            icon={ShieldCheck}
            title="Entrar como técnico de TI"
            text="Gerenciar fila e atendimentos"
            onClick={() => onLogin("tecnico")}
          />
        </div>
        <p className="mt-7 text-center text-xs text-slate-500">
          {apiUrl
            ? "Piloto com banco local. Ainda não possui autenticação corporativa."
            : "Protótipo sem integração real. Não use dados pessoais ou sensíveis."}
        </p>
      </div>
    </main>
  );
}
function LoginBtn({ icon: I, title, text, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left hover:border-sky-400 hover:bg-sky-50"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-700">
        <I />
      </span>
      <span>
        <b className="block">{title}</b>
        <small className="text-slate-500">{text}</small>
      </span>
    </button>
  );
}
function Home({
  tickets,
  open,
  go,
}: {
  tickets: T[];
  open: (c: string) => void;
  go: (i: number) => void;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-sky-800 to-cyan-600 p-7 text-white">
        <span className="text-sm font-semibold">Olá, João 👋</span>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Como podemos ajudar?
        </h1>
        <p className="mt-3 text-sky-50">
          Escolha o tipo de problema. Abrir um chamado leva menos de um minuto.
        </p>
      </section>
      <h2 className="text-lg font-bold">O que está acontecendo?</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {cats.map(({ n, i: I }) => (
          <button
            key={n}
            onClick={() => open(n)}
            className="rounded-2xl border bg-white p-4 text-left shadow-sm hover:border-sky-300"
          >
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <I />
            </span>
            <b>{n}</b>
          </button>
        ))}
      </div>
      <h2 className="mt-9 text-lg font-bold">Meus chamados</h2>
      <div className="mt-4 space-y-3">
        {tickets.slice(0, 3).map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className="flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left"
          >
            <span>
              <small className="font-bold text-sky-700">{t.protocolo}</small>
              <b className="mt-1 block">{t.title}</b>
              <small className="text-slate-500">{t.created}</small>
            </span>
            <Badge s={t.status} />
          </button>
        ))}
      </div>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="mt-2 [&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:bg-white [&>*]:p-3 [&>*]:outline-none [&>*:focus]:ring-2 [&>*:focus]:ring-sky-400">
        {children}
      </div>
    </label>
  );
}
function New({ cat, back, submit }: any) {
  const [c, setC] = useState(cat || "Computador"),
    [title, setTitle] = useState(""),
    [setor, setSetor] = useState("Secretaria de Administração"),
    [description, setDescription] = useState(""),
    [attachment, setAttachment] = useState("");
  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={back} className="mb-5 flex gap-2">
        <ArrowLeft />
        Voltar
      </button>
      <div className="rounded-3xl border bg-white p-6 sm:p-8">
        <small className="font-bold uppercase text-sky-700">Novo chamado</small>
        <h1 className="mt-2 text-2xl font-bold">Conte o que aconteceu</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Preencha apenas o essencial. Não inclua senhas ou dados pessoais.
        </p>
        <div className="space-y-5">
          <Field label="Categoria">
            <select value={c} onChange={(e) => setC(e.target.value)}>
              {cats.map((x) => (
                <option key={x.n}>{x.n}</option>
              ))}
            </select>
          </Field>
          <Field label="Resumo do problema">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Impressora não imprime"
            />
          </Field>
          <Field label="Onde está acontecendo?">
            <select value={setor} onChange={(e) => setSetor(e.target.value)}>
              <option>Secretaria de Administração</option>
              <option>Secretaria de Educação</option>
              <option>Secretaria de Saúde</option>
              <option>Gabinete</option>
            </select>
          </Field>
          <Field label="Descreva o problema">
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Diga quando começou e o que aparece na tela..."
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 text-sm">
            <Paperclip />
            {attachment || "Adicionar foto ou arquivo (simulado)"}
            <input
              className="hidden"
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0]?.name || "")}
            />
          </label>
          <button
            disabled={title.length < 5 || description.length < 10}
            onClick={() =>
              submit({ category: c, title, setor, description, attachment })
            }
            className="w-full rounded-xl bg-sky-700 p-3.5 font-bold text-white disabled:opacity-40"
          >
            Abrir chamado
          </button>
        </div>
      </div>
    </div>
  );
}
function Success({ t, view, home }: any) {
  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-3xl border bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={64} />
        <h1 className="mt-5 text-2xl font-bold">Chamado aberto com sucesso!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Guarde o protocolo para acompanhar.
        </p>
        <div className="my-6 rounded-2xl bg-slate-50 p-5">
          <small>PROTOCOLO</small>
          <div className="text-2xl font-black text-sky-700">{t.protocolo}</div>
        </div>
        <button
          onClick={view}
          className="w-full rounded-xl bg-sky-700 p-3 font-bold text-white"
        >
          Acompanhar chamado
        </button>
        <button onClick={home} className="mt-2 w-full p-3">
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
function Detail({ t, role, back, update, add }: any) {
  const [text, setText] = useState(""),
    [internal, setInternal] = useState(false),
    [resolution, setResolution] = useState(t.resolution || "");
  return (
    <div className="mx-auto max-w-5xl">
      <button onClick={back} className="mb-5 flex gap-2">
        <ArrowLeft />
        Voltar
      </button>
      <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
        <section className="rounded-2xl border bg-white">
          <div className="border-b p-5">
            <div className="flex gap-2">
              <small className="font-bold text-sky-700">{t.protocolo}</small>
              <Badge s={t.status} />
            </div>
            <h1 className="mt-3 text-2xl font-bold">{t.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {t.category} · {t.setor}
            </p>
          </div>
          <div className="min-h-72 space-y-4 p-5">
            <Bubble author="João Silva" text={t.description} />
            {t.messages
              .filter((m: Msg) => role === "tecnico" || !m.internal)
              .map((m: Msg) => (
                <Bubble
                  key={m.id}
                  author={(m.internal ? "Nota interna · " : "") + m.author}
                  text={m.text}
                  internal={m.internal}
                />
              ))}
            {t.resolution && (
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
                <b>Solução registrada</b>
                <p className="mt-2">{t.resolution}</p>
              </div>
            )}
          </div>
          <div className="border-t p-4">
            {role === "tecnico" && (
              <label className="mb-3 flex gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                />
                Nota interna — invisível para o servidor
              </label>
            )}
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="min-w-0 flex-1 rounded-xl border p-3"
              />
              <button
                onClick={() => {
                  if (text.trim()) {
                    add(text, internal);
                    setText("");
                  }
                }}
                className="rounded-xl bg-sky-700 p-3 text-white"
              >
                <Send />
              </button>
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-5">
            <h2 className="font-bold">Detalhes</h2>
            <Info l="Categoria" v={t.category} />
            <Info l="Prioridade" v={t.priority} />
            <Info l="Responsável" v={t.assignee} />
            {t.attachment && <Info l="Anexo simulado" v={t.attachment} />}
          </div>
          {role === "tecnico" && (
            <div className="rounded-2xl border bg-white p-5">
              <h2 className="mb-4 font-bold">Atendimento</h2>
              <Field label="Status">
                <select
                  value={t.status}
                  onChange={(e) => update({ status: e.target.value })}
                >
                  {[
                    "Aberto",
                    "Em atendimento",
                    "Aguardando usuário",
                    "Resolvido",
                    "Fechado",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <div className="mt-4">
                <Field label="Técnico responsável">
                  <select
                    value={t.assignee}
                    onChange={(e) =>
                      update({
                        assignee: e.target.value,
                        status:
                          t.status === "Aberto" ? "Em atendimento" : t.status,
                      })
                    }
                  >
                    <option>Não atribuído</option>
                    <option>Mariana Costa</option>
                    <option>Carlos Lima</option>
                    <option>Rafael Souza</option>
                  </select>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Resumo da solução">
                  <textarea
                    rows={3}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </Field>
              </div>
              <button
                onClick={() =>
                  resolution.trim() &&
                  update({ resolution, status: "Resolvido" })
                }
                className="mt-4 w-full rounded-xl bg-emerald-600 p-3 font-bold text-white"
              >
                Registrar resolução
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
function Bubble({ author, text, internal }: any) {
  return (
    <div
      className={`rounded-2xl p-4 ${internal ? "border border-amber-200 bg-amber-50" : "bg-sky-50"}`}
    >
      <b className="text-xs">{author}</b>
      <p className="mt-2 text-sm">{text}</p>
    </div>
  );
}
function Dashboard({ tickets, go }: any) {
  const count = (s: Status) => tickets.filter((t: T) => t.status === s).length;
  return (
    <div>
      <small className="font-bold text-sky-700">Painel técnico</small>
      <h1 className="mt-1 text-3xl font-bold">Bom dia, Mariana</h1>
      <p className="text-sm text-slate-500">
        Veja o que precisa de atenção hoje.
      </p>
      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric l="Novos" v={count("Aberto")} i={Ticket} />
        <Metric l="Em atendimento" v={count("Em atendimento")} i={Clock3} />
        <Metric
          l="Aguardando"
          v={count("Aguardando usuário")}
          i={MessageSquare}
        />
        <Metric l="Resolvidos" v={count("Resolvido")} i={CheckCircle2} />
      </div>
      <div className="mt-7 rounded-2xl border bg-white">
        <h2 className="border-b p-5 font-bold">Chamados que exigem atenção</h2>
        <List tickets={tickets} go={go} />
      </div>
    </div>
  );
}
function Queue({ tickets, go }: any) {
  const [q, setQ] = useState(""),
    [s, setS] = useState("Todos");
  const list = useMemo(
    () =>
      tickets.filter(
        (t: T) =>
          (s === "Todos" || t.status === s) &&
          (t.title + t.protocolo + t.setor)
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [tickets, q, s],
  );
  return (
    <div>
      <small className="font-bold text-sky-700">Atendimento</small>
      <h1 className="mt-1 text-3xl font-bold">Fila de chamados</h1>
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl border px-3">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar protocolo, assunto ou setor"
            className="w-full py-3 outline-none"
          />
        </label>
        <select
          value={s}
          onChange={(e) => setS(e.target.value)}
          className="rounded-xl border p-3"
        >
          {[
            "Todos",
            "Aberto",
            "Em atendimento",
            "Aguardando usuário",
            "Resolvido",
            "Fechado",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="mt-4 rounded-2xl border bg-white">
        <List tickets={list} go={go} />
      </div>
    </div>
  );
}
function List({ tickets, go }: any) {
  return (
    <div className="divide-y">
      {tickets.map((t: T) => (
        <button
          key={t.id}
          onClick={() => go(t.id)}
          className="grid w-full grid-cols-[1fr_auto] gap-3 p-4 text-left hover:bg-slate-50 sm:grid-cols-[90px_1fr_150px_130px]"
        >
          <small className="font-bold text-sky-700">#{t.id}</small>
          <span>
            <b className="block text-sm">{t.title}</b>
            <small className="text-slate-500">{t.setor}</small>
          </span>
          <span className="hidden text-sm sm:block">{t.assignee}</span>
          <Badge s={t.status} />
        </button>
      ))}
    </div>
  );
}
function Metric({ l, v, i: I }: any) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-700">
        <I size={19} />
      </span>
      <div className="mt-4 text-3xl font-black">{v}</div>
      <small className="text-slate-500">{l}</small>
    </div>
  );
}
function Nav({ screen, set }: any) {
  return (
    <nav className="space-y-1">
      <button
        onClick={() => set("dashboard")}
        className={`flex w-full gap-3 rounded-xl p-3 ${screen === "dashboard" ? "bg-sky-50 text-sky-700" : ""}`}
      >
        <LayoutDashboard />
        Visão geral
      </button>
      <button
        onClick={() => set("queue")}
        className={`flex w-full gap-3 rounded-xl p-3 ${screen !== "dashboard" ? "bg-sky-50 text-sky-700" : ""}`}
      >
        <Ticket />
        Fila de chamados
      </button>
    </nav>
  );
}
function Badge({ s }: { s: Status }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${sc[s]}`}
    >
      {s}
    </span>
  );
}
function Info({ l, v }: any) {
  return (
    <div className="mt-4 border-t pt-4">
      <small className="font-bold uppercase text-slate-400">{l}</small>
      <p className="text-sm">{v}</p>
    </div>
  );
}
