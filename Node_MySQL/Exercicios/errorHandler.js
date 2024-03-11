function createError(statusCode, message) {
    return {
      statusCode: statusCode,
      message: { error: message },
    };
  }
  
  module.exports = {
    DATABASE_ERROR: createError(500, 'Erro ao aceder Ã  base de dados'),
    RESOURCE_NOT_FOUND: createError(404, 'O recurso pedido nÃ£o existe'),
    INVALID_FILTER: createError(400, 'O filtro usado para este recurso nÃ£o Ã© permitido'),
    INVALID_VERB: createError(405, 'O verbo usado para aceder a este recurso nÃ£o Ã© permitido'),
    NO_BODY_DATA: createError(400, 'Pedido sem dados: dados obrigatÃ³rios - name e city'),
    AUTHOR_NOT_FOUND: createError(404, 'Autor nÃ£o encontrado')
  };