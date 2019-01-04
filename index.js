const bunyan = require( "bunyan" );
const path = require( "path" );
const fs = require( "fs" );
const SettingsUI = require( "tera-mod-ui" ).Settings;

// Settings UI
let ui = null;

const GENERAL_LOG_PATH = path.join( __dirname, "logs" );
const GROUP_NAME = "player-ep";
const ROOT_COMMAND = "epl";
const ROOT_COMMAND_ALTS = ["ep-log", "ep-logger"];
let hookManager = null;

class EPLogger {
    constructor( mod ) {
        const UtilLib = mod.require["util-lib"];
        let chat = new UtilLib["chat-helper"]( mod );
        let msgBuilder = new UtilLib["message-builder"]();
        hookManager = new UtilLib["hook-manager"]( mod );
        // TODO retrieve server name from server id
        this.region = mod.region;
        this.mod = mod;
        this.logger = {};
        if ( !fs.existsSync( GENERAL_LOG_PATH ) ) fs.mkdirSync( GENERAL_LOG_PATH );

        this.initHooks();
        if ( !mod.settings || mod.settings.enabled ) {
            EPLogger.startLogging();
        }
        let commands = {
            $default() {
                msgBuilder.clear();
                appendBool( msgBuilder, EPLogger.switchLogging() );
                chat.printMessage( msgBuilder.toHtml() );
            },
            config: function() {
                if ( ui ) {
                    ui.show();
                }
            },
            help: {
                long() {
                    msgBuilder.clear();
                    msgBuilder.text( "USAGE: " );
                    msgBuilder.command( ROOT_COMMAND );
                    msgBuilder.text( "\nEP-Logger " );
                    appendBool( msgBuilder, mod.settings && mod.settings.enabled ); // FIXME does not change to "disabled" when mod is disabled
                    msgBuilder.color().text( "\nA Logger for logging EP data. Enables/Disables logger by default." );
                    msgBuilder.text(
                        `For more help use "${ROOT_COMMAND} help [subcommand]". Subcommands are listed below.`
                    );
                    return msgBuilder.toHtml();
                },
                short() {
                    return "The EP calculator.";
                },
                $default() {
                    printHelpList( this.help );
                },
                config: {
                    long() {
                        msgBuilder.clear();
                        msgBuilder.text( "USAGE: " );
                        msgBuilder.command( ROOT_COMMAND );
                        msgBuilder.color().text( " config" );
                        return msgBuilder.toHtml();
                    },
                    short() {
                        return "Opens a window for configuration if proxy is running in gui mode.";
                    },
                    $default() {
                        printHelpList( this.help.config );
                    }
                }
            }
        };

        mod.command.add( ROOT_COMMAND, commands, commands );
        for ( let cmd of ROOT_COMMAND_ALTS ) {
            mod.command.add( cmd, commands, commands );
        }

        if ( global.TeraProxy.GUIMode ) {
            let structure = require( "./settings_structure" );
            ui = new SettingsUI( mod, structure, mod.settings, { height: 232 });
            ui.on( "update", settings => {
                mod.settings = settings;
            });

            this.destructor = () => {
                if ( ui ) {
                    ui.close();
                    ui = null;
                }
            };
        }

        function appendBool( msgBuilder, value ) {
            if ( value ) {
                msgBuilder.color( chat.COLOR_ENABLE ).text( "enabled" );
            } else {
                msgBuilder.color( chat.COLOR_DISABLE ).text( "disabled" );
            }
            return msgBuilder.color();
        }

        function printHelpList( cmds = commands.help ) {
            chat.printMessage( cmds.long() );
            let keys = Object.keys( cmds );
            let ignoredKeys = ["$default", "short", "long"];
            if ( keys.length <= ignoredKeys.length ) return;
            chat.printMessage( "subcommands:" );
            for ( let c of keys ) {
                if ( !ignoredKeys.includes( c ) ) {
                    chat.printMessage( `<font color="${chat.COLOR_HIGHLIGHT}">${c}</font>  -  ${cmds[c].short()}` );
                }
            }
        }
    }

    get logName() {
        let me = this.mod.game.me;
        // TODO use server name instead of server id
        return `EP-${me.serverId}-${me.name}-${new Date().toISOString().slice( 0, 10 )}`;
    }

    logData( logName, data, title ) {
        if ( !this.logger[logName]) {
            this.logger[logName] = bunyan.createLogger({
                name: logName,
                streams: [
                    {
                        path: path.join( GENERAL_LOG_PATH, `${logName}.log` ),
                        level: "debug"
                    }
                ]
            });
        }
        let serializedData = EPLogger.serializeData( data );
        this.logger[logName].debug({
            title: title,
            data: serializedData,
            localeTime: new Date().toLocaleTimeString()
        });
    }

    static serializeData( data ) {
        let serializedData = {};
        for ( let p in data ) {
            if ( typeof data[p] === "object" ) serializedData[p] = EPLogger.serializeData( data[p]);
            else if ( typeof data[p] === "bigint" ) serializedData[p] = data[p].toString();
            else {
                serializedData[p] = JSON.stringify( data[p]);
            }
        }
        return serializedData;
    }

    static switchLogging() {
        if ( hookManager.hasActiveGroup( GROUP_NAME ) ) return EPLogger.stopLogging();
        else return EPLogger.startLogging();
    }

    static startLogging() {
        hookManager.hookGroup( GROUP_NAME );
        return true;
    }

    static stopLogging() {
        hookManager.unhookGroup( GROUP_NAME );
        return false;
    }

    initHooks() {
        hookManager.addTemplate( GROUP_NAME, "S_PLAYER_CHANGE_EP", 1, e => {
            this.logData( this.logName, e, "S_PLAYER_CHANGE_EP" );
        });

        hookManager.addTemplate( GROUP_NAME, "S_LOAD_EP_INFO", 1, e => {
            this.logData( this.logName, e, "S_LOAD_EP_INFO" );
        });

        hookManager.addTemplate( GROUP_NAME, "S_SHOW_USER_EP_INFO", 1, e => {
            this.logData( this.logName, e, "S_SHOW_USER_EP_INFO" );
        });

        hookManager.addTemplate( GROUP_NAME, "S_CHANGE_EP_POINT", 1, e => {
            this.logData( this.logName, e, "S_CHANGE_EP_POINT" );
        });

        hookManager.addTemplate( GROUP_NAME, "S_CHANGE_EP_EXP_DAILY_LIMIT", 1, e => {
            this.logData( this.logName, e, "S_CHANGE_EP_EXP_DAILY_LIMIT" );
        });
    }

    destructor() {
        EPLogger.stopLogging();
    }
}

module.exports = EPLogger;
