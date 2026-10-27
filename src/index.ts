export default {
  async fetch(): Promise<Response> {
    return new Response(
      JSON.stringify({
        status: "placeholder",
        project: "Karim7744 CEO Robot V100",
        mode: "additive-only",
        warning: "Ce fichier est un espace de départ sans exécution non vérifiée."
      }, null, 2),
      {
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      }
    );
  }
};
