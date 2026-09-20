"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient, type SkillRow } from "@/lib/supabase-browser";
import { toSlug } from "@/lib/slug";
import { Check, ChevronLeft, Eye, FileText, ImagePlus, LayoutDashboard, Link as LinkIcon, Pencil, Plus, Search, Settings, ShoppingBag, Trash2, Upload, X } from "lucide-react";

type Skill = {
  id: string | number;
  title: string;
  category: string;
  price: string;
  status: "Đang bán" | "Bản nháp";
  description: string;
  resourceUrl: string;
};

const initialSkills: Skill[] = [
  { id: 1, title: "Thương hiệu cá nhân", category: "Hình ảnh", price: "199.000đ", status: "Đang bán", description: "Xây nhận diện hình ảnh nhất quán cho từng bài đăng.", resourceUrl: "https://drive.google.com/" },
  { id: 2, title: "Poster sản phẩm", category: "Hình ảnh", price: "149.000đ", status: "Đang bán", description: "Biến ảnh sản phẩm thành poster quảng cáo nổi bật.", resourceUrl: "https://drive.google.com/" },
  { id: 3, title: "Video viral dọc", category: "Video", price: "299.000đ", status: "Đang bán", description: "Lên hook, kịch bản và prompt cho video ngắn.", resourceUrl: "https://drive.google.com/" },
  { id: 4, title: "Khung podcast 2 người", category: "Video", price: "299.000đ", status: "Bản nháp", description: "Cắt podcast thành short dọc với bố cục hai khung.", resourceUrl: "" },
];

const blankSkill: Omit<Skill, "id"> = { title: "", category: "Hình ảnh", price: "", status: "Bản nháp", description: "", resourceUrl: "" };

export default function AdminPage() {
  const [skills, setSkills] = useState(initialSkills);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Omit<Skill, "id">>(blankSkill);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const loadSkills = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("skills")
      .select("id, title, category, price_vnd, status, description, resource_url")
      .order("created_at");
    if (error || !data?.length) return;
    setSkills((data as Pick<SkillRow, "id" | "title" | "category" | "price_vnd" | "status" | "description" | "resource_url">[]).map((skill) => ({
      id: skill.id,
      title: skill.title,
      category: skill.category,
      price: `${new Intl.NumberFormat("vi-VN").format(skill.price_vnd)}đ`,
      status: skill.status === "published" ? "Đang bán" : "Bản nháp",
      description: skill.description,
      resourceUrl: skill.resource_url ?? "",
    })));
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: allowed } = user ? await supabase.rpc("is_skilllab_admin") : { data: false };
      setIsAdmin(Boolean(allowed));
      setAuthReady(true);
      await loadSkills();
    });
  }, []);
  const visibleSkills = useMemo(() => skills.filter((skill) => skill.title.toLowerCase().includes(query.toLowerCase())), [skills, query]);

  const openNew = () => { if (!isAdmin) { setNotice("Hãy đăng nhập bằng email quản trị để thêm Skill."); return; } setForm(blankSkill); setEditing({ id: 0, ...blankSkill }); };
  const openEdit = (skill: Skill) => { if (!isAdmin) { setNotice("Hãy đăng nhập bằng email quản trị để chỉnh sửa."); return; } const { id: _id, ...values } = skill; setForm(values); setEditing(skill); };
  const signIn = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setNotice(error ? error.message : "Đã gửi liên kết đăng nhập. Hãy mở email và bấm vào liên kết đó.");
  };
  const save = async () => {
    if (!form.title.trim() || !form.price.trim()) { setNotice("Hãy nhập tên Skill và giá trước khi lưu."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isAdmin) { setNotice("Bạn chưa có quyền lưu Skill."); return; }
    const payload = { title: form.title.trim(), category: form.category, price_vnd: Number(form.price.replace(/\D/g, "")), status: form.status === "Đang bán" ? "published" : "draft", description: form.description, resource_url: form.resourceUrl || null };
    const result = editing?.id
      ? await supabase.from("skills").update(payload).eq("id", editing.id)
      : await supabase.from("skills").insert({ ...payload, slug: `${toSlug(form.title)}-${Date.now()}`, delivery: "Sẽ cập nhật trong Admin", accent: "yellow" });
    if (result.error) { setNotice(result.error.message); return; }
    setEditing(null); await loadSkills(); setNotice("Đã lưu vào SkillLab. Website cập nhật ngay.");
  };
  const remove = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isAdmin || !editing?.id) return;
    const { error } = await supabase.from("skills").delete().eq("id", editing.id);
    if (error) { setNotice(error.message); return; }
    setEditing(null); await loadSkills(); setNotice("Đã xóa Skill.");
  };

  return <main className="min-h-screen bg-[#f6f5f0] text-[#161616]">
    <aside className="fixed inset-y-0 hidden w-64 border-r border-black/10 bg-[#111] p-5 text-white lg:block">
      <a href="/" className="flex items-center gap-3 px-2 py-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d8ff32] font-black text-black">S</span><span className="text-xl font-black tracking-[-.06em]">skill<span className="text-[#d8ff32]">lab</span></span></a>
      <p className="mt-9 px-2 text-[10px] font-black uppercase tracking-[.2em] text-white/35">Không gian quản trị</p>
      <nav className="mt-3 space-y-1 text-sm font-bold"><a className="flex items-center gap-3 rounded-xl bg-[#d8ff32] px-3 py-3 text-black" href="#tong-quan"><LayoutDashboard size={18} /> Tổng quan</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/65 hover:bg-white/10" href="#skills"><ShoppingBag size={18} /> Quản lý Skill <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs">{skills.length}</span></a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/65 hover:bg-white/10" href="#thu-vien"><FileText size={18} /> Tài nguyên</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/65 hover:bg-white/10" href="#cai-dat"><Settings size={18} /> Cài đặt</a></nav>
      <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs font-black text-[#d8ff32]">{isAdmin ? "ĐÃ ĐĂNG NHẬP" : "ĐÃ KHÓA QUẢN TRỊ"}</p><p className="mt-2 text-xs leading-5 text-white/50">{isAdmin ? "Bạn có quyền thêm, sửa và xóa dữ liệu thật trên Supabase." : "Chỉ email quản trị đã được cấp quyền mới có thể thay đổi kho Skill."}</p></div>
    </aside>

    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-black/10 bg-[#f6f5f0]/90 px-5 backdrop-blur md:px-10"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">SkillLab / Admin</p><h1 className="mt-1 text-xl font-black tracking-[-.05em]">Quản lý kho Skill</h1></div><div className="flex items-center gap-3"><a href="/" className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold md:flex"><Eye size={16} /> Xem website</a><button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-[#151515] px-4 py-3 text-sm font-black text-white"><Plus size={17} /> Thêm Skill</button></div></header>
      <section id="tong-quan" className="mx-auto max-w-7xl p-5 md:p-10">{!isAdmin && authReady && <div className="mb-6 rounded-3xl border border-[#d8ff32]/60 bg-[#171717] p-5 text-white md:flex md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#d8ff32]">Đăng nhập quản trị</p><p className="mt-2 text-sm text-white/60">Nhập email quản trị để nhận liên kết đăng nhập an toàn.</p></div><div className="mt-4 flex gap-2 md:mt-0"><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@cuaban.com" className="min-w-0 rounded-xl bg-white px-3 py-2.5 text-sm text-black outline-none" /><button onClick={signIn} className="rounded-xl bg-[#d8ff32] px-4 py-2.5 text-sm font-black text-black">Gửi liên kết</button></div></div>}<div className="rounded-3xl bg-[#171717] p-7 text-white md:p-9"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#d8ff32]">{isAdmin ? "Xin chào, Phương" : "Kho dữ liệu trực tuyến"}</p><h2 className="mt-3 text-4xl font-black tracking-[-.07em]">Kho Skill đang<br /><span className="text-[#d8ff32]">sẵn sàng vận hành.</span></h2></div><button onClick={openNew} className="rounded-xl bg-[#d8ff32] px-5 py-3 text-sm font-black text-black">+ Tạo Skill mới</button></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Tổng Skill" value={String(skills.length)} note="Trong thư viện" /><Stat label="Đang bán" value={String(skills.filter((item) => item.status === "Đang bán").length)} note="Hiển thị cho khách" /><Stat label="Bản nháp" value={String(skills.filter((item) => item.status === "Bản nháp").length)} note="Chưa công khai" /><Stat label="Đơn hàng" value="—" note="Kết nối ở bước thanh toán" /></div>
        <section id="skills" className="mt-10 rounded-3xl border border-black/10 bg-white p-5 md:p-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-xs font-black uppercase tracking-[.16em] text-black/40">Thư viện Skill</p><h2 className="mt-2 text-2xl font-black tracking-[-.06em]">Nội dung đang hiển thị</h2></div><div className="relative w-full md:w-72"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm Skill..." className="w-full rounded-xl border border-black/10 bg-[#fafafa] py-3 pl-10 pr-4 text-sm outline-none focus:border-black" /></div></div>
          <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-black/10 text-xs font-black uppercase tracking-[.1em] text-black/40"><tr><th className="pb-3">Skill</th><th className="pb-3">Danh mục</th><th className="pb-3">Giá</th><th className="pb-3">Trạng thái</th><th className="pb-3 text-right">Thao tác</th></tr></thead><tbody>{visibleSkills.map((skill) => <tr key={skill.id} className="border-b border-black/5 last:border-0"><td className="py-4"><p className="font-black">{skill.title}</p><p className="mt-1 max-w-xs truncate text-xs text-black/45">{skill.description}</p></td><td className="py-4"><span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold">{skill.category}</span></td><td className="py-4 font-black">{skill.price}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${skill.status === "Đang bán" ? "bg-[#d8ff32]/45 text-black" : "bg-black/8 text-black/55"}`}>{skill.status}</span></td><td className="py-4 text-right"><button onClick={() => openEdit(skill)} className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-black hover:bg-black hover:text-white"><Pencil size={14} /> Sửa</button></td></tr>)}</tbody></table></div></section>
        <section id="thu-vien" className="mt-6 grid gap-5 md:grid-cols-2"><div className="rounded-3xl border border-black/10 bg-white p-6"><ImagePlus className="text-[#b65300]" /><h3 className="mt-6 text-xl font-black tracking-[-.05em]">Ảnh bìa Skill</h3><p className="mt-2 text-sm leading-6 text-black/50">Bản chính thức sẽ tải ảnh lên kho lưu trữ và tự tối ưu cho website.</p><button className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-black"><Upload size={16} /> Tải ảnh lên</button></div><div id="cai-dat" className="rounded-3xl border border-black/10 bg-white p-6"><LinkIcon className="text-[#b65300]" /><h3 className="mt-6 text-xl font-black tracking-[-.05em]">Link tài nguyên</h3><p className="mt-2 text-sm leading-6 text-black/50">Dán link Google Drive, Notion hoặc trang hướng dẫn cho từng Skill.</p><p className="mt-5 text-xs font-bold text-black/35">Khách chỉ nhận link sau khi thanh toán được xác nhận.</p></div></section>
      </section></div>
    {notice && <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-[#161616] p-4 text-sm font-bold text-white shadow-2xl"><button onClick={() => setNotice("")} className="float-right ml-3 text-white/50"><X size={16} /></button><Check className="mb-2 text-[#d8ff32]" size={18} />{notice}</div>}
    {editing && <div className="fixed inset-0 z-40 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"><div className="mx-auto my-8 w-full max-w-2xl rounded-[28px] bg-[#f8f7f2] p-6 shadow-2xl md:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#b65300]">Skill editor</p><h2 className="mt-2 text-3xl font-black tracking-[-.07em]">{editing.id ? "Chỉnh sửa Skill" : "Tạo Skill mới"}</h2></div><button onClick={() => setEditing(null)} className="rounded-xl border border-black/10 p-2"><X size={19} /></button></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Tên Skill *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Multishot" /></Field><Field label="Danh mục"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Hình ảnh</option><option>Video</option><option>Biên tập video</option></select></Field><Field label="Giá bán *"><input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Ví dụ: 249.000đ" /></Field><Field label="Trạng thái"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Skill["status"] })}><option>Đang bán</option><option>Bản nháp</option></select></Field></div><Field label="Mô tả ngắn" wide><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Skill này giúp khách làm được điều gì?" /></Field><Field label="Link nhận tài nguyên" wide><input value={form.resourceUrl} onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })} placeholder="https://drive.google.com/..." /></Field><div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-black/10 pt-5">{editing.id ? <button onClick={() => { setSkills((current) => current.filter((skill) => skill.id !== editing.id)); setEditing(null); setNotice("Đã xóa Skill trong bản demo."); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600"><Trash2 size={16} /> Xóa Skill</button> : <span />}<div className="flex gap-3"><button onClick={() => setEditing(null)} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-black">Hủy</button><button onClick={save} className="rounded-xl bg-[#161616] px-5 py-3 text-sm font-black text-white">Lưu Skill</button></div></div></div></div>}
  </main>;
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) { return <div className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-xs font-black uppercase tracking-[.13em] text-black/40">{label}</p><p className="mt-4 text-4xl font-black tracking-[-.07em]">{value}</p><p className="mt-2 text-xs text-black/45">{note}</p></div>; }
function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`mt-5 block ${wide ? "" : ""}`}><span className="text-xs font-black uppercase tracking-[.12em] text-black/45">{label}</span><div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-black/10 [&_input]:bg-white [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-black/10 [&_select]:bg-white [&_select]:px-4 [&_select]:py-3 [&_select]:text-sm [&_textarea]:min-h-24 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-black/10 [&_textarea]:bg-white [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm">{children}</div></label>; }
