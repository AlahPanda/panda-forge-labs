import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { site } from '@/content';
import { useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';

type LegalKind = 'privacy' | 'terms';

interface Props {
  kind?: LegalKind;
}

function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-zinc-400">{children}</p>;
}

function LegalList({ children }: { children: ReactNode }) {
  return <ul className="mt-3 list-disc space-y-2 pl-6 text-zinc-400">{children}</ul>;
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function PrivacyContent({ contactEmail }: { contactEmail: string | null }) {
  return (
    <>
      <LegalSection title="1. Identificação do responsável pelo tratamento">
        <LegalParagraph>
          O presente website, disponibilizado em <strong>alahpanda-labs.vercel.app</strong>, é operado por <strong>AlahPanda Labs</strong>
          (“AlahPanda Labs”, “nós”). Para efeitos de proteção de dados, a AlahPanda Labs atua como responsável pelo tratamento
          relativamente aos tratamentos de dados descritos nesta política.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Contacto</strong>: {contactEmail ? (
            <a className="text-signal hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          ) : (
            <strong>placeholder</strong>
          )}
          {contactEmail ? null : (
            <> (não foi configurada uma variável de ambiente de contacto; utiliza os canais de contacto disponibilizados no website).</>
          )}
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Âmbito e enquadramento legal (Portugal/União Europeia — RGPD)">
        <LegalParagraph>
          Esta Política de Privacidade aplica-se à utilização do website e descreve como tratamos dados pessoais. O tratamento de
          dados é realizado em conformidade com o <strong>Regulamento (UE) 2016/679 (RGPD)</strong> e demais legislação aplicável em
          <strong> Portugal</strong> e na <strong>União Europeia</strong>.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="3. Dados recolhidos">
        <LegalParagraph>Consoante a tua interação com o website, poderemos tratar as seguintes categorias de dados:</LegalParagraph>
        <LegalList>
          <li><strong>Dados técnicos e de utilização</strong>: endereço IP (em certos casos), identificadores do dispositivo/navegador, páginas visitadas, eventos e métricas de desempenho.</li>
          <li><strong>Identificadores online</strong>: cookies e identificadores de publicidade, quando aplicável (por exemplo, associados a plataformas de anúncios).</li>
        </LegalList>
        <LegalParagraph>
          Não pretendemos recolher categorias especiais de dados. Se tal ocorrer por via de terceiros, aplica-se o disposto nas respetivas políticas.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Finalidades do tratamento">
        <LegalParagraph>Utilizamos dados pessoais, em especial, para:</LegalParagraph>
        <LegalList>
          <li><strong>Disponibilização e segurança</strong> do website (prevenção de abuso, manutenção, deteção de falhas).</li>
          <li><strong>Funcionamento técnico</strong> e melhoria da experiência de utilização.</li>
          <li><strong>Monetização e publicidade</strong>, quando ativa, através de <strong>Google AdSense</strong>.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. Cookies e Web Beacons">
        <LegalParagraph>
          Utilizamos <strong>cookies</strong> e tecnologias semelhantes (incluindo <strong>web beacons/pixels</strong>) para assegurar o funcionamento do
          website e, quando aplicável, para fins de medição e publicidade.
        </LegalParagraph>
        <LegalParagraph>
          Alguns cookies podem ser estritamente necessários; outros dependem do teu consentimento, quando exigido pela legislação aplicável.
          Podes gerir cookies nas definições do navegador e/ou nas opções de consentimento do website, quando disponíveis.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="6. Google AdSense e terceiros (transparência — AdSense/Third-party)">
        <LegalParagraph>
          O website pode ser monetizado através de <strong>Google AdSense</strong>. Quando o AdSense está ativo, a Google e os seus parceiros podem
          recolher e tratar dados (incluindo cookies/identificadores) para <strong>apresentação, personalização</strong> e <strong>medição</strong> de anúncios.
        </LegalParagraph>
        <LegalParagraph>
          Em particular, a Google pode utilizar o <strong>cookie DART</strong> para permitir a apresentação de anúncios com base na tua visita a este
          website e/ou a outros websites na Internet. A utilização do cookie DART e demais tecnologias de publicidade é gerida por terceiros,
          nos termos das respetivas políticas.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Third-party</strong>: a AlahPanda Labs não controla diretamente os tratamentos efetuados por estes terceiros. Recomenda-se a consulta das
          políticas de privacidade e publicidade da Google para compreender as finalidades, categorias de dados e opções de configuração/opt-out.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="7. Infraestruturas e tecnologias de terceiros (Vercel e GitHub API)">
        <LegalParagraph>
          O website é desenvolvido com <strong>React</strong> e <strong>Vite</strong> e poderá recorrer a serviços de terceiros para alojamento e entrega
          (por exemplo, <strong>Vercel</strong>). Poderão ainda existir integrações técnicas com a <strong>GitHub API</strong> para consulta de informação
          e metadados.
        </LegalParagraph>
        <LegalParagraph>
          Estes prestadores podem atuar como subcontratantes e tratar dados técnicos necessários à prestação do serviço (por exemplo, logs e
          telemetria). Quando aplicável, poderão ocorrer transferências internacionais de dados, sendo procurados mecanismos de conformidade adequados.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Conservação">
        <LegalParagraph>
          Conservamos dados pessoais apenas durante o período necessário às finalidades descritas, ou durante o tempo exigido por obrigações legais
          e/ou para defesa de direitos em caso de litígio.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Direitos dos titulares (RGPD)">
        <LegalParagraph>
          Nos termos do RGPD, poderás exercer, quando aplicável, os direitos de <strong>acesso</strong>, <strong>retificação</strong>, <strong>apagamento</strong>,
          <strong> limitação</strong>, <strong>oposição</strong> e <strong>portabilidade</strong>, bem como retirar o consentimento quando o tratamento se baseie nele.
        </LegalParagraph>
        <LegalParagraph>
          Podes ainda apresentar reclamação junto da autoridade de controlo competente, nos termos legais.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <LegalSection title="1. Aceitação dos Termos">
        <LegalParagraph>
          Ao acederes e utilizares o website <strong>alahpanda-labs.vercel.app</strong>, operado por <strong>AlahPanda Labs</strong>, confirmas que leste,
          compreendeste e aceitas os presentes Termos de Serviço. Se não concordares, deves cessar a utilização.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Propriedade intelectual (modpacks e conteúdos)">
        <LegalParagraph>
          Salvo indicação em contrário, os conteúdos do website (incluindo textos, design, marcas e elementos gráficos) encontram-se protegidos por
          direitos de propriedade intelectual. O uso não autorizado pode constituir violação da legislação aplicável.
        </LegalParagraph>
        <LegalParagraph>
          No caso de modpacks e conteúdos técnicos, poderão aplicar-se licenças específicas de terceiros (por exemplo, licenças de mods e dependências).
          A disponibilização de ligações, listas ou compilações não implica concessão de direitos além dos previstos nas licenças aplicáveis.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title='3. Isenção de responsabilidade ("as is")'>
        <LegalParagraph>
          O website é disponibilizado <strong>“as is”</strong> e <strong>“conforme disponível”</strong>, sem garantias de qualquer natureza, expressas ou implícitas,
          incluindo, sem limitar, garantias de disponibilidade contínua, ausência de erros ou adequação a um fim específico.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Limitação de responsabilidade">
        <LegalParagraph>
          Na máxima medida permitida por lei, a AlahPanda Labs não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais
          ou punitivos, resultantes do acesso, utilização ou impossibilidade de utilização do website, ainda que avisada da possibilidade de tais danos.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Jurisdição e foro (Portugal)">
        <LegalParagraph>
          Estes termos regem-se pela lei de <strong>Portugal</strong> e pela legislação aplicável da <strong>União Europeia</strong>. Para a resolução de litígios,
          é competente o foro da <strong>comarca da residência/sede em Portugal</strong>, sem prejuízo de normas imperativas aplicáveis ao consumidor quando existam.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

export default function Legal({ kind }: Props) {
  const [searchParams] = useSearchParams();
  const kindFromQuery = searchParams.get('kind');
  const resolvedKind: LegalKind =
    kind ?? (kindFromQuery === 'privacy' || kindFromQuery === 'terms' ? kindFromQuery : 'privacy');

  const isPrivacy = resolvedKind === 'privacy';
  const contactEmail =
    (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ||
    (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ||
    site.contactEmail ||
    null;
  return (
    <SiteLayout>
      <Seo
        title={`${isPrivacy ? 'Política de Privacidade' : 'Termos de Serviço'} — AlahPanda Labs`}
        description={
          isPrivacy
            ? 'Política de Privacidade (RGPD) e transparência sobre cookies e terceiros (Google AdSense).'
            : 'Termos de Serviço aplicáveis ao uso do website AlahPanda Labs.'
        }
      />
      <section className="container max-w-3xl py-16">
        <div className="label-mono">07 — Legal</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
          {isPrivacy ? 'Política de Privacidade' : 'Termos de Serviço'}
        </h1>
        <p className="mt-6 text-muted-foreground">Última atualização: {new Date().toISOString().slice(0, 10)}</p>

        <article className="mt-10 text-foreground/85">
          {isPrivacy ? <PrivacyContent contactEmail={contactEmail} /> : <TermsContent />}
        </article>
      </section>
    </SiteLayout>
  );
}
