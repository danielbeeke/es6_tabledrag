(function ($, Drupal, drupalSettings) {

  Drupal.tableDrag = function () {};
  Drupal.tableDrag.prototype.row = function () {};

  let typeMapping = {
    order: 'weight',
    depth: 'depth'
  };

  let rowTableFieldIterator = (table, tableSettings, callback) => {
    Object.keys(tableSettings).forEach((fieldName) => {
      let column = tableSettings[fieldName];

      Object.keys(column).forEach((index) => {
        let fieldData = column[index];
        let fields = table.querySelectorAll('.' + fieldData.target);

        if (typeMapping[fieldData.action]) {
          Array.from(fields).forEach((field) => {
            let row = field.closest('tr');
            callback(row, field, fieldData);
          });
        }
      });
    });
  };

  Drupal.behaviors.tableDrag = {
    attach: function attach(context, settings) {
      Object.keys(settings.tableDrag).forEach((tableId) => {
        let tableSettings = settings.tableDrag[tableId];
        let table = document.querySelector('#' + tableId);

        Drupal.behaviors.tableDrag.hideFieldCells(table, tableSettings);
        Drupal.behaviors.tableDrag.addDataAttributes(table, tableSettings);

        let editSettingsEvent = new CustomEvent('editSettings', {
          detail: tableSettings
        });

        table.dispatchEvent(editSettingsEvent);

        Drupal.tableDrag[tableId] = new TableDrag(table, tableSettings);

        table.addEventListener('change', () => {
          Drupal.behaviors.tableDrag.writeDataAttributesToForm(table, tableSettings);
        })
      });
    },

    addDataAttributes: function (table, tableSettings) {
      rowTableFieldIterator(table, tableSettings, (row, field, fieldData) => {
        row.dataset[typeMapping[fieldData.action]] = field.value;
      });
    },

    writeDataAttributesToForm (table, tableSettings) {
      rowTableFieldIterator(table, tableSettings, (row, field, fieldData) => {
        field.value = row.dataset[typeMapping[fieldData.action]];
      });
    },

    hideFieldCells (table, tableSettings) {
      let hideColumnsOnTablePart = (children, columnIndex) => {
        Array.from(children).forEach((row) => {
          Array.from(row.children).forEach((cell, cellIndex) => {
            if (cellIndex === columnIndex) {
              cell.classList.add('hidden');
            }
          })
        });
      };

      Object.keys(tableSettings).forEach((fieldName) => {
        let column = tableSettings[fieldName];

        Object.keys(column).forEach((index) => {
          let fieldData = column[index];
          let field = table.querySelector('.' + fieldData.target);
          let cell = field.closest('td');
          let columnIndex = null;
          cell.parentNode.querySelectorAll('td').forEach((td, delta) => {
            if (td === cell) columnIndex = delta;
          });

          hideColumnsOnTablePart(table.querySelector('tbody').children, columnIndex);
          hideColumnsOnTablePart(table.querySelector('thead').children, columnIndex);
        });
      });
    }
  }
})(jQuery, Drupal, drupalSettings);