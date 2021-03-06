/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { ConnectionString  } from './connectionString';
import { ConnectionStringEditView } from './connectionStringEditView';
import { useLocalizationContext } from '../../shared/contexts/localizationContext';
import { ResourceKeys } from '../../../localization/resourceKeys';
import { CONNECTION_STRING_LIST_MAX_LENGTH } from '../../constants/browserStorage';
import { StateInterface } from '../../shared/redux/state';
import { upsertConnectionStringAction, deleteConnectionStringAction, setConnectionStringsAction } from '../actions';
import { setActiveAzureResourceByConnectionStringAction } from '../../azureResource/actions';
import { ROUTE_PARTS } from '../../constants/routes';
import { formatConnectionStrings } from '../../shared/utils/hubConnectionStringHelper';
import '../../css/_layouts.scss';
import './connectionStringsView.scss';

export interface ConnectionStringsViewProps {
    connectionStrings: string[];
    onDeleteConnectionString(connectionString: string): void;
    onUpsertConnectionString(newConnectionString: string, connectionString: string): void;
    onSelectConnectionString(connectionString: string, hostName: string): void;
}

export const ConnectionStringsView: React.FC<ConnectionStringsViewProps> = props => {
    const [ connectionStringUnderEdit, setConnectionStringUnderEdit ] = React.useState<string>(undefined);
    const { connectionStrings, onDeleteConnectionString, onUpsertConnectionString, onSelectConnectionString } = props;
    const { t } = useLocalizationContext();

    const onAddConnectionStringClick = () => {
        setConnectionStringUnderEdit('');
    };

    const onEditConnectionStringClick = (connectionString: string) => {
        setConnectionStringUnderEdit(connectionString);
    };

    const onConnectionStringEditCommit = (connectionString: string) => {
        onUpsertConnectionString(connectionString, connectionStringUnderEdit);
        setConnectionStringUnderEdit(undefined);
    };

    const onConnectionStringEditDismiss = () => {
        setConnectionStringUnderEdit(undefined);
    };

    return (
        <div className="view">
            <div className="view-command">
                <CommandBar
                    items={[
                        {
                            ariaLabel: t(ResourceKeys.connectionStrings.addConnectionCommand.ariaLabel),
                            disabled: connectionStrings.length >= CONNECTION_STRING_LIST_MAX_LENGTH,
                            iconProps: { iconName: 'Add' },
                            key: 'add',
                            onClick: onAddConnectionStringClick,
                            text: t(ResourceKeys.connectionStrings.addConnectionCommand.label)
                        }
                    ]}
                />
            </div>
            <div className="view-content view-scroll-vertical">
                <div className="connection-strings">
                    {connectionStrings.map(connectionString =>
                        <ConnectionString
                            key={connectionString}
                            connectionString={connectionString}
                            onEditConnectionString={onEditConnectionStringClick}
                            onDeleteConnectionString={onDeleteConnectionString}
                            onSelectConnectionString={onSelectConnectionString}
                        />
                    )}
                </div>
            </div>
            {connectionStringUnderEdit !== undefined &&
                <ConnectionStringEditView
                    connectionStringUnderEdit={connectionStringUnderEdit}
                    connectionStrings={connectionStrings}
                    onDismiss={onConnectionStringEditDismiss}
                    onCommit={onConnectionStringEditCommit}
                />
            }
        </div>
    );
};

export const ConnectionStringsViewContainer: React.FC<RouteComponentProps> = props => {
    const connectionStrings = useSelector((state: StateInterface) => state.connectionStringsState.connectionStrings);
    const dispatch = useDispatch();

    const onUpsertConnectionString = (newConnectionString: string, connectionString?: string) => {
        dispatch(upsertConnectionStringAction({newConnectionString, connectionString}));
    };

    const onDeleteConnectionString = (connectionString: string) => {
        dispatch(deleteConnectionStringAction(connectionString));
    };

    const onSelectConnectionString = (connectionString: string, hostName: string) => {
        const updatedConnectionStrings = formatConnectionStrings(connectionStrings, connectionString);

        dispatch(setConnectionStringsAction(updatedConnectionStrings));
        dispatch(setActiveAzureResourceByConnectionStringAction({
            connectionString,
            hostName
        }));

        props.history.push(`/${ROUTE_PARTS.RESOURCE}/${hostName}/${ROUTE_PARTS.DEVICES}`);
    };

    return (
        <ConnectionStringsView
            onUpsertConnectionString={onUpsertConnectionString}
            onDeleteConnectionString={onDeleteConnectionString}
            onSelectConnectionString={onSelectConnectionString}
            connectionStrings={connectionStrings}
        />
    );
};
