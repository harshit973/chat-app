import { useRouter } from "next/navigation";

interface NavigateHelperType {
  router: ReturnType<typeof useRouter>;
  navigateTo: (route: string) => void;
  replaceCurrentAndNavigateTo: (route: string) => void;
}

export class RouteHandler implements NavigateHelperType {
  router;
  constructor(router: ReturnType<typeof useRouter>) {
    this.router = router;
  }
  navigateTo = (route: string) => {
    this.router.push(route);
  };
  replaceCurrentAndNavigateTo = (route: string) => {
    this.router.replace(route);
  };
}
