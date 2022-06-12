require('./core/db')(() => {
    require('./core/bot')(data => {
        require('./core/app')(data);
    });
});
