import { PresensiLoginAside } from '@/components/presensi/PresensiLoginAside';
import { PresensiLoginForm } from '@/components/presensi/PresensiLoginForm';

/**
 * Sign-in screen of the Attendly portal: pine editorial showcase beside the credential form, in
 * place of the workspace while no backend session cookie exists.
 *
 * @returns Two-column login grid.
 */
export function PresensiLoginScreen() {
  return (
    <div className="mx-auto my-auto flex w-full max-w-7xl flex-col px-margin py-space-xl sm:px-gutter">
      <div className="grid grid-cols-1 items-stretch gap-space-lg lg:grid-cols-12 lg:gap-space-2xl">
        <PresensiLoginAside />
        <PresensiLoginForm />
      </div>
    </div>
  );
}
