describe("Basic tests for TeamReact", () => {
    beforeEach(() => {

        Cypress.on('uncaught:exception', (err, runnable) => {
            // debugger
            return false

        })

        // Cypress.on('fail', (err) => {
        //     debugger
        // })


        cy.server();
        cy.route("POST", '/auth').as('logIn');
        cy.route('/auth').as('logOut');
        cy.route("/media/cache/json/*.json").as("SiteData");
        cy.visit("/");
        cy.wait("@SiteData", {timeout: 120000}); // Wait 30sec max for siteData gen
        cy.get('.layout-menu-button ').click();
        cy.get('.username').click();
        cy.get(".profile-expanded > li > a > span").click();
        cy.get(":nth-child(1) > .p-inputtext").type("robin"); // username field
        cy.get(":nth-child(2) > .p-inputtext").type("1234");  // pw field
        cy.get(".p-dialog-footer :nth-child(1) > .p-button-text").click();
        // logged in
        // cy.wait("@logIn");
        cy.wait("@SiteData", {timeout: 120000}); // Wait 30sec max for siteData gen
        cy.wait(3000);
    });

//    it("Test gen menu function", () => {
//        cy.server();
//        cy.route('ui/menu/**').as('getMenu');
//        let win = cy.window();
//        cy.wait('@getMenu').debug();
//        }
//    );
    it("SlaveElems should update on nav update and be expandable", () => {
        cy.route('/api/tickets/TicketsBySite?**').as('getTicketData');
        cy.route('/api/working/**').as('getSessionData');

        cy.visit("http://127.0.0.1:8000/#/api/tickets/Sites/1").wait("@getTicketData");
        //cy.wait(200);
        cy.get('.l-nav-next > .pi').click().wait("@getTicketData");
        cy.get('.l-button-expand-grid:last').click().wait("@getTicketData");
        cy.get(".l-grid-header").contains("Tickets");
        cy.get('.p-datatable-tbody > :nth-child(3) > :nth-child(3)').click(); // 3ed row, 1st cell
        cy.get(".l-detail-header").contains("Tickets");
        cy.get(".l-slave-summary-expand-button:first").click();


    });

    it("Should be possible to click on menu items and close menu", () => {

        // Open first menu item
        cy.get('.layout-menu-button').click();
        cy.get('.layout-main-menu > :nth-child(1) > :nth-child(2)').click();
        // cy.wait(2000);
        // For some reason I can't pinpoint the height of the side-menu gets messed up on this portion
        // Only happens in test env, not going to dig too deep rn.
        cy.get(".active-menuitem > ul > :nth-child(1) > a > span").click();
        // cy.wait(400);
        cy.get(".layout-menu-button > .pi").click();
        cy.get(".layout-mask").click();
        cy.get(".layout-menu-button > .pi").click();

    });

    it("Should be possible to login and out", () => {
        cy.get(".layout-menu-button > .pi").click();
        cy.get(".profile-link > .username").click();
        cy.get(".profile-expanded > :nth-child(1) > a > span").click();
        // logged out

        // cy.wait('@getUserSettings');
    });

    it("Should be possible to log in again and navigate around ", () => {
        cy.route('/api/**').as('getData');
        cy.route('/api/tickets/**').as('getTicketData');

        //cy.get('[style="margin:5px"] > :nth-child(1) > :nth-child(4)').click().wait("@getData"); // goto allTickets via html
        //cy.get('.p-datatable-tbody > :nth-child(3) > :nth-child(3)').dblclick().wait("@getData",{timeout:10000}); // 3ed row, 3ed cell
        //cy.get('a[style="text-decoration:none"]').eq(5).click().wait("@getData"); // goto allTickets via html
        cy.get(".layout-menu-button > .pi").click(); // open menu

        cy.get(".layout-main-menu > :nth-child(3) > :nth-child(2)").click();
        cy.get(".active-menuitem > ul > :nth-child(3) > a").click().wait("@getTicketData");
        //cy.get('.layout-main-menu > :nth-child(1) > :nth-child(2)').click();
        cy.get('.p-datatable-tbody > :nth-child(3) > :nth-child(2)').dblclick().wait(1000);

        // Test nav arrows
        cy.get('.l-nav-last:not(.p-disabled) > .pi').click().wait("@getTicketData").wait(100);
        cy.get('.l-nav-first:not(.p-disabled) > .pi').click().wait("@getTicketData").wait(100);
        cy.get('.l-nav-next:not(.p-disabled) > .pi').click().wait("@getTicketData").wait(100);
        cy.get('.l-nav-prev:not(.p-disabled) > .pi').click().wait("@getTicketData").wait(100);

        // test detail -> other detail
        cy.get('.l-button-fk:first').click(); // opens Site
        cy.wait("@getData");
        cy.get(":nth-child(1) > .l-grid-col-detail_link > :nth-child(2) > div > a").wait("@getData"); // wait to load...
        cy.get('.layout-home-button').click();

        cy.get(".layout-menu-button > .pi").click(); // open menu

        // cy.get(".layout-main-menu > :nth-child(3) > :nth-child(2)").click();
        cy.get(".active-menuitem > ul > :nth-child(3) > a").click().wait("@getTicketData");

        cy.get('.p-paginator-pages > :nth-child(2)').click().wait("@getTicketData");
        cy.get('.p-paginator-prev').click().wait("@getTicketData");
        cy.get('.p-paginator-next').click().wait("@getTicketData");

        //cy.go('/').wait(1000);
        cy.go('back').wait(1000);
        cy.visit('/')
        // opens Site again
        //cy.get('.l-button-fk:first').click().wait("@getData");
        cy.get('.layout-home-button').click();

        // Todo move into a seperate test for about page
        cy.get(".layout-menu-button > .pi").click(); // open menu
        cy.get(".layout-main-menu > :last ").click();
        cy.get(".active-menuitem > ul > :last > a").click().wait("@getData");

        cy.get('.l-detail-header').contains("About");
    });

    it("Should use mt + mk to allow navigation of slave-details", () => {
        cy.route('/api/**').as('getData');

        cy.visit("http://127.0.0.1:8000/#/api/tickets/Sites/1");
        cy.get(".p-tabview-nav > :nth-child(2)").click().wait("@getData");
        cy.get('.p-datatable-tbody > :nth-child(3) > :nth-child(2)').click();
        cy.log("Entering last session record for this site");
        cy.get('.l-nav-first > .pi').click().wait("@getData");
    });

    it("Should allow quick filtering of grid view", () => {
        cy.route('/api/**').as('getData');
        cy.visit("http://127.0.0.1:8000/#/api/tickets/AllTickets").wait("@getData");

        cy.get(".l-grid-quickfilter").type("foo");
        cy.wait("@getData");
        cy.get(".l-grid-quickfilter").type(" so bar");
        cy.get('.p-datatable-tbody > :nth-child(1) > .l-grid-col-summary').contains("Why is foo so bar");
    });


    it("Should be possible to navigate to another detail using quick find", () => {
        cy.route('/api/**').as('getData');
        cy.route('/choices/**').as('getChoices');
        cy.visit("http://127.0.0.1:8000/#/api/tickets/Tickets/1").wait("@getData");
        cy.get(".l-detail-quicksearch input").type("68").wait("@getChoices");
        cy.get('.p-autocomplete-list-item').click();
        cy.get(".l-detail-header").contains("#68");

    });

    it("Should be able to run simple actions", () => {
        cy.route('/api/**').as('getData');
        cy.visit("http://127.0.0.1:8000/#/api/tickets/AllTickets/10").wait("@getData");
        // cy.get("")
        cy.log("Start session").get('.l-panel-vertical > :nth-child(3) > div > span > a:nth-child(1)').click().wait("@getData")
        // cy.log("Change State to talk and back to working").get('.l-panel-vertical > :nth-child(3) > div > span > a:nth-child(5)').click().wait("@getData").wait("@getData")
        // cy.get('.l-panel-vertical > :nth-child(3) > div > span > a:nth-child(4)').click().wait("@getData").wait("@getData")

    });


    // more tests here
});
