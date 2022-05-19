export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object){
  return new Promise((resolve, reject) => {
    // open connection to the database with the version of 1
    const request = window.indexedDB.open('shop-shop', 1);

    // create variables to hold reference to the database, transaction(tx), and object store
    let db, tx, store;

    // if version has changed (or first time using db)
    request.onupgradeneeded = function(e){
      const db = request.result;

      // create object store of each type of data and set 'primary' key
      db.createObjectStore('products', { keyPath: '_id'});
      db.createObjectStore('categories', { keyPath: '_id'});
      db.createObjectStore('cart', { keyPath: '_id'});
    };

    // handle any errors
    request.onerror = function(e){
      console.log('There was an error');
    };

    // on db open success
    request.onsuccess = function(e){
      // save a reference of db
      db = request.result;

      // open a transaction to storeName variable
      tx = db.transaction(storeName, 'readwrite');

      // save reference to object store
      store = tx.objectStore(storeName);

      // if error
      db.onerror = function(e){
        console.log('error', e);
      };

      // when transaction is complete, close connection
      tx.oncomplete = function(){
        db.close();
        switch(method){
          case 'put':
            store.put(object);
            resolve(object);
            break;
          case 'get':
            const all = store.getAll();
            all.onsuccess = function(){
              resolve(all.result);
            };
            break;
          case 'delete':
            store.delete(object._id);
            break;
          default:
            console.log('No valid method');
            break;
        }
      };
    };
  });
};
