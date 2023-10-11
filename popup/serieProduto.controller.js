angular
    .module('app')
    .controller('SerieProdutoController', ['$scope', '$popupInstance', 'SkI18nService', 'ServiceProxy', 'MessageUtils', 'StringUtils', 'DateUtils', 'DateUtilsConstants', 'i18n', 'data', '$http', 'ObjectUtils', 'AngularUtil', 'SkApplicationInstance',
    function ($scope, $popupInstance, SkI18nService, ServiceProxy, MessageUtils, StringUtils, DateUtils, DateUtilsConstants, i18n, data, $http, ObjectUtils, AngularUtil, SkApplicationInstance) {   
         
        var self = this;

        //ObjectUtils.implements(self, IFormInterceptor);
      //Interceptors
      ObjectUtils.implements(self, IDynaformInterceptor);
      ObjectUtils.implements(self, IDatagridInterceptor);
      ObjectUtils.implements(self, IFilterPanelInterceptor);
      ObjectUtils.implements(self, IFormInterceptor);

      //Funcções
      self.onDynaformLoaded = onDynaformLoaded;

        // Implementações da interface IFormInterceptor
        self.interceptBuildField = interceptBuildField;

        self.dsSerie;

        self.keydownHandler = keydownHandler;
        var _keymap = { ENTER: 13 };
        self.txtCodBarra;


        self.gridConfigId = SkApplicationInstance.getResourceID()+'-SerieProduto.gridConfig';

        var _dsTGFEDUPOP = data.dsTGFEDUPOP;


        self.onConfigurableFormCreated = onConfigurableFormCreated;
        var _configurableForm;
        
        
        self.onDatasetCreated = onDatasetCreated;
        //self.metadataInterceptor = metadataInterceptor;

        function onDynaformLoaded(dynaform, dataset) {

            console.log(dynaform);
            console.log(dataset);
            console.log("Executando função onDynaformLoaded");
            
  
            if (dataset.getEntityName() == 'AD_TGFEDUPOP') {
                self.dsSerie = dataset;
                self.dsSerie.initAndRefresh();
  
            }
        }

        function keydownHandler($event) {
  
            var key = $event.keyCode;
            console.log('Key: ' + key);
            
            if (key == _keymap.ENTER) {
              console.log('Clicou no Enter');
              incluir();
            }
      
        };


        function incluir() {
          
            console.log('Entrou na function Incluir');
            console.log(self.txtCodBarra);
      
            //self.txtCodBarra = self.txtCodBarra.toUpperCase()
            
            if (StringUtils.isEmpty(self.txtCodBarra)) {
                MessageUtils.showAlert("Preencha o Código de Barras");
                focusOnCodBarras();
                return;
            }

            if (StringUtils.isNotEmpty(self.txtCodBarra)) {
                console.log('Entrou no if Incluir');
                // Quebra a string em várias linhas usando o caractere de quebra de linha
                var stringsArray = self.txtCodBarra.split("  ");

                var records = [];
                // Imprime cada linha separadamente
                for (var i = 0; i < stringsArray.length; i++) {
                    records.push({'values':{'0': _dsTGFEDUPOP.getFieldValueAsNumber('SEQ') ,'1': stringsArray[i]}});
                    
                }

                console.log(records, stringsArray);

                var params =    {
                    'dataSetID':'00B'
                    , 'entityName':'AD_TGFEDUPOP'
                    , 'standAlone':false
                    , 'fields':['SEQ','CODPARC']
                    , 'records': records
                    , 'ignoreListenerMethods':''
                };


                ServiceProxy.callService('mge@DatasetSP.save', params).then(function () {
                    
                    self.dsSerie.refresh();

                });

                self.txtCodBarra = undefined;
                focusOnCodBarras();
      
            }
        }
        
        function focusOnCodBarras() {
            console.log("Executando a Funcao focusOnCodBarras()");
      
            window.setTimeout(function () { 
              var input = document.getElementById('txtCodBarras');
              angular.element(input).focus();
            }, 400); 
            
        }


        function onDatasetCreated(dataset) {

            console.log("EnviarPedidosController -> onDatasetCreated");

            // if (dataset.getEntityName() == 'SerieProduto') {
            //     self.dsSerie = dataset;
            // }

            if (dataset.getEntityName() == 'AD_TGFEDUPOP') {
                self.dsSerie = dataset;
                self.dsSerie.initAndRefresh();
             }

            self.datasetActionButtonContext = new DatasetActionButtonContext(dataset);

            //dataset.addCriteriaProvider(new CriteriaProvider(Criteria('this.CODPARC = ' + _dsTGFEDUPOP.getFieldValueAsString('=CODPARC')  + ' And this.SEQUENCIA = ' + _dsTGFEDUPOP.getFieldValueAsString('SEQUENCIA')  )));

            dataset.initAndRefresh().then(function () {
                console.log('Refresh realizado');
            });
        }

       
        function onConfigurableFormCreated(formApi) {
            _configurableForm = formApi;
        }

        function interceptBuildField(fieldName, dataset, fieldProp, scope) {

            var entityName = dataset.getEntityName();

        }

        // Função responsável por montar o componente CEP
        function montaComponenteCep(entity, complementoField, dataset, fieldProp, scope) {
            var fieldCodCid = entity + 'CODCID' + complementoField;
            var fieldCodEnd = entity + 'CODEND' + complementoField;
            var fieldCodBai = entity + 'CODBAI' + complementoField;
  
            var fieldNumEnd = entity + (complementoField == '' ? 'NUMEND' : 'NUM') + complementoField;
  
            fieldProp['sk-field-name'] = entity + 'CEP' + complementoField;
  
            fieldProp['sk-intercept-address-info'] = 'interceptAddressInfo';
            scope.interceptAddressInfo = function (addressInfo) {
                addressInfo.CODCID = dataset.getFieldValueAsString(fieldCodCid);
                addressInfo.CODEND = dataset.getFieldValueAsString(fieldCodEnd);
                addressInfo.NUMEND = dataset.getFieldValueAsString(fieldNumEnd);
            };
  
            scope.codsAddressBind = {CIDADE: fieldCodCid, BAIRRO: fieldCodBai, ENDERECO: fieldCodEnd};
            fieldProp['sk-cods-address-bind'] = 'codsAddressBind';
  
            return AngularUtil.createDirective('sk-cep-input', fieldProp, scope);
          
          }
        


        
    }]);
        