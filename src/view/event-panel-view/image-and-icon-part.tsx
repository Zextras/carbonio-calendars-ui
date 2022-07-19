/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';
import { Avatar, Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

const IconContainer = styled(Avatar)`
	width: 48px;
	height: 48px;
`;

export const ImageAndIconPart = ({
	icon = 'CalendarOutline',
	color
}: {
	icon?: string;
	color: string;
}): ReactElement => (
	<Container>
		<IconContainer icon={icon} label="" background={color} />
	</Container>
);
