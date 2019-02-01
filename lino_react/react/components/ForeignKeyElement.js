import React, {Component} from "react";
import PropTypes from "prop-types";

import {SiteContext} from "./SiteContext"
import {Labeled} from "./LinoComponents"

import {Button} from 'primereact/button';
import {AutoComplete} from 'primereact/autocomplete';
import queryString from "query-string";
import {fetch as fetchPolyfill} from "whatwg-fetch";


export class ForeignKeyElement extends Component {

    static propTypes = {
        prop_bundle: PropTypes.object,

    };
    static defaultProps = {};

    constructor(props) {
        super();
        this.state = {
            rows:[],
        };
    }


    componentDidMount() {

    };

    getChoices(query, siteData) {
        // if (query.length < 3) return;
        // let actor = siteData.actors[this.props.elem.field_options.related_actor_id];

        let ajaxQuery = {
            query: query,
            start: 0,
            //todo have pageing / some sort of max amount
        };

        fetchPolyfill(`/${this.props.prop_bundle.action_dialog? "apchoices" : "choices"}/${this.props.prop_bundle.actorId.replace(".","/")}${this.props.prop_bundle.action_dialog? `/${this.props.prop_bundle.action.an}` : ""}/${this.props.elem.name}?${queryString.stringify(ajaxQuery)}`).then(
            (res) => (res.json())
        ).then(
            (data => this.setState({
                rows: data.rows,
            }))
        );
    }

    openExternalLink(siteData) {
        let props = this.props;
        return (e) => {
            let {match} = props.prop_bundle,
                actor = siteData.actors[props.elem.field_options.related_actor_id],
                // detail_action = actor.ba[actor.detail_action],
                // insert_action = actor.ba[actor.insert_action],
                // [packId, actorId] = props.elem.field_options.related_actor_id.split("."),
                pk = props.in_grid ? props.data[props.elem.fields_index + 1]
                    : props.data[props.elem.name + 'Hidden'],
                status = {record_id: pk};

            if (actor.slave) {
                status.mk = props.prop_bundle.mk;
                status.mt = props.prop_bundle.mt;
            }
            // console.log(props.elem, detail_action);
            window.App.runAction({
                an: actor.detail_action, actorId: props.elem.field_options.related_actor_id,
                rp: null, status: status
            });
            // match.history.push(`/api/${packId}/${actorId}/${pk}`);
        }
    };

    render() {
        const props = this.props,
            {update_value} = props.prop_bundle;
        // return loaded ? this.props.render(data, Comp) : <p>{placeholder}</p>;
        let value = (props.in_grid ? props.data[props.elem.fields_index] : props.data[props.elem.name]);

        if (value && typeof value === "object") value = value['text'];
        let {editing_mode} = props;

        // props.prop_bundle.update_value({[props.elem.name]: e.value})
        return <SiteContext.Consumer>{(siteData) => (
            <Labeled {...props.prop_bundle} elem={props.elem} labeled={props.labeled} isFilled={value}>
                <div className="l-ForeignKeyElement">
                    {editing_mode ?
                        <AutoComplete value={value} onChange={(e) => update_value({[props.elem.name]: e.value})}
                                      suggestions={this.state.rows}
                                      dropdown={true}
                                      onFocus={(e)=>e.target.select()}
                                      field={"text"}
                                      completeMethod={(e) => this.getChoices(e.query, siteData)}
                        />

                        : <React.Fragment>
                            <div
                                dangerouslySetInnerHTML={{__html: value || "\u00a0"}}/>
                            {value &&
                            <Button icon="pi pi-external-link" className="p-button-secondary l-button-fk"
                                    onClick={this.openExternalLink(siteData)}
                            />}
                        </React.Fragment>}
                </div>

            </Labeled>)}</SiteContext.Consumer>

    }
}
